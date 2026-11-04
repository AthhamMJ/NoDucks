import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS =
  process.env.EMAIL_FROM || "NoDucks <onboarding@resend.dev>";

export const sendVerificationEmail = async (to, link) => {
  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
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
  });

  if (error) {
    throw new Error(`Email send failed: ${error.message}`);
  }

  return data.id;
};