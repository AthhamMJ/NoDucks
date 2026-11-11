import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FORM_ADDRESS =
  process.env.EMAIL_FROM || "NoDucks <onboarding@resend.dev>";

export const sendOtpEmail = async (to, code) => {
  const { data, error } = await resend.emails.send({
    from: FORM_ADDRESS,
    to,
    subject: "Your NoDucks verification code",
    html: `
        <p>Your Noducks Verification code is:</p>
        <p style="fonst-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</p>
        <p>This code expires in 10 minutes, If you didn't request it, you can ignore this email.</p>
    `,
  });

  if (error) {
    throw new Error(`Email send failed: ${error.message}`);
  }

  return data.id;
};
