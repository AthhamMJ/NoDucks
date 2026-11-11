import "dotenv/config";
import { sendOtpEmail } from "../services/emailService.js";

const to = process.argv[2];
if (!to) {
  console.error("Usage: node scripts/testEmail.js you@example.com");
  process.exit(1);
}

const code = String(Math.floor(100000 + Math.random() * 900000));

try {
  const id = await sendOtpEmail(to, code);
  console.log(`Sent. Resend id: ${id}, code: ${code}`);
} catch (err) {
  console.error(err.message);
  process.exit(1);
}