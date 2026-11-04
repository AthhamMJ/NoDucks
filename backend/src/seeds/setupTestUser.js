/**
 * Sets up a dedicated test user for Postman collection runs.
 * Safe to run multiple times — upserts the user.
 * Run with: node src/seeds/setupTestUser.js
 */
import 'dotenv/config';
import connectDB from '../config/db.js';
import User from '../models/User.js';

await connectDB();

const email = 'postman.test@noducks.com';
const password = 'TestPass123!';

// Delete any existing test user so we can recreate cleanly
await User.deleteOne({ email });

// Create via Mongoose so the pre-save hook hashes the password correctly
const user = new User({
  name: 'Postman Test User',
  email,
  password,        // plain text — pre-save hook will hash it
  role: 'admin',
  isActive: true,
  plan: 'free',
});
await user.save();

console.log(`✅ Test user created successfully`);
console.log(`   Email: ${email}`);
console.log(`   Password: ${password}`);

process.exit(0);
