/**
 * One-time script: promotes testuser@noducks.com to admin role.
 * Run with: node src/seeds/makeAdmin.js
 */
import 'dotenv/config';
import connectDB from '../config/db.js';
import User from '../models/User.js';

await connectDB();

const email = 'testuser@noducks.com';
const user = await User.findOneAndUpdate(
  { email },
  { role: 'admin' },
  { returnDocument: "after" }
).select('name email role');

if (user) {
  console.log(`✅ Promoted to admin: ${user.name} (${user.email}) — role: ${user.role}`);
} else {
  console.log(`❌ User not found: ${email}`);
}

process.exit(0);
