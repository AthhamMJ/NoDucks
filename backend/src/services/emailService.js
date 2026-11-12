import nodemailer from "nodemailer";
import { Resend } from "resend";

let resendClient = null;
if (process.env.RESEND_API_KEY) {
  resendClient = new Resend(process.env.RESEND_API_KEY);
}

// Create reusable transporter for Nodemailer (e.g. Gmail, SMTP, or test ethereal)
const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Gmail service shortcut if provided
  if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS, // App Password
      },
    });
  }

  return null;
};

const FROM_ADDRESS =
  process.env.EMAIL_FROM ||
  (process.env.GMAIL_USER ? `NoDucks <${process.env.GMAIL_USER}>` : null) ||
  (process.env.SMTP_USER ? `NoDucks <${process.env.SMTP_USER}>` : null) ||
  "NoDucks <onboarding@resend.dev>";

/**
 * Universal email sender that uses Nodemailer if configured,
 * or falls back to Resend API, and gracefully falls back to console logging
 * during local development so registration / reset is never broken.
 */
export const sendMail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: FROM_ADDRESS,
        to,
        subject,
        html,
        text,
      });
      console.log(`[Email Service] Delivered via Nodemailer to ${to} (${info.messageId})`);
      return { success: true, messageId: info.messageId, provider: "nodemailer" };
    } catch (err) {
      console.warn("[Email Service] Nodemailer send failed, checking fallback:", err.message);
      if (!resendClient && process.env.NODE_ENV === "production") {
        throw err;
      }
    }
  }

  if (resendClient) {
    try {
      const { data, error } = await resendClient.emails.send({
        from: FROM_ADDRESS,
        to,
        subject,
        html,
      });

      if (error) {
        console.warn("[Email Service] Resend API error:", error.message);
        if (process.env.NODE_ENV === "production") {
          throw new Error(`Email send failed: ${error.message}`);
        }
      } else if (data?.id) {
        console.log(`[Email Service] Delivered via Resend to ${to} (${data.id})`);
        return { success: true, messageId: data.id, provider: "resend" };
      }
    } catch (resendErr) {
      console.warn("[Email Service] Resend send exception:", resendErr.message);
      if (process.env.NODE_ENV === "production") {
        throw resendErr;
      }
    }
  }

  // Graceful fallback for local development / testing:
  // Output OTP code prominently in terminal so the user/developer is never blocked
  console.log("\n=======================================================");
  console.log(" [NODUCKS EMAIL DISPATCH - DEV / CONSOLE FALLBACK]");
  console.log(` To:      ${to}`);
  console.log(` Subject: ${subject}`);
  if (text) {
    console.log(` Message: ${text}`);
  }
  console.log("=======================================================\n");

  return { success: true, messageId: `dev-${Date.now()}`, provider: "console" };
};

export const sendVerificationOtpEmail = async (to, otp) => {
  return await sendMail({
    to,
    subject: `Your NoDucks Verification Code: ${otp}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border-radius: 14px; border: 1px solid rgba(0,0,0,0.08);">
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 20px; font-weight: 700; color: #111; margin: 0 0 8px 0; letter-spacing: -0.01em;">Verify Your NoDucks Account</h2>
          <p style="font-size: 14px; color: #666; margin: 0;">Use the 6-digit code below to complete your registration or verification.</p>
        </div>

        <div style="background: #f4f4f8; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #111; font-family: monospace;">${otp}</span>
        </div>

        <p style="font-size: 13px; color: #888; line-height: 1.5; margin: 16px 0 0 0;">
          This code will expire in <strong>10 minutes</strong>. If you did not request this, please safely ignore this email.
        </p>
      </div>
    `,
    text: `Your NoDucks verification code is ${otp}. It expires in 10 minutes.`,
  });
};

export const sendPasswordResetOtpEmail = async (to, otp) => {
  return await sendMail({
    to,
    subject: `NoDucks Password Reset Code: ${otp}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border-radius: 14px; border: 1px solid rgba(0,0,0,0.08);">
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 20px; font-weight: 700; color: #111; margin: 0 0 8px 0; letter-spacing: -0.01em;">Reset Your NoDucks Password</h2>
          <p style="font-size: 14px; color: #666; margin: 0;">We received a request to reset your password. Use the verification code below to set a new password.</p>
        </div>

        <div style="background: #f4f4f8; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #111; font-family: monospace;">${otp}</span>
        </div>

        <p style="font-size: 13px; color: #888; line-height: 1.5; margin: 16px 0 0 0;">
          This code will expire in <strong>10 minutes</strong>. If you did not request a password reset, your account is safe and you can ignore this email.
        </p>
      </div>
    `,
    text: `Your NoDucks password reset code is ${otp}. It expires in 10 minutes.`,
  });
};

// Backwards-compatible link sender (in case link verification is referenced elsewhere)
export const sendVerificationEmail = async (to, link) => {
  return await sendMail({
    to,
    subject: "Verify your NoDucks account",
    html: `
      <p>Welcome to NoDucks. Click the button below to verify your email:</p>
      <p>
        <a href="${link}" style="display:inline-block;padding:12px 20px;background:#111;color:#fff;text-decoration:none;border-radius:6px;">
          Verify my email
        </a>
      </p>
      <p>This link expires in 30 minutes. If you didn't sign up, you can ignore this email.</p>
    `,
    text: `Verify your email at: ${link}`,
  });
};
