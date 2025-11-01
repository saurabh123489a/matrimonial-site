/**
 * Script to create admin user
 * Run with: node backend/scripts/createAdmin.js
 * 
 * Usage:
 * node backend/scripts/createAdmin.js <name> <email> <phone> <password> <gender>
 * 
 * Example:
 * node backend/scripts/createAdmin.js "Admin User" admin@ekgahoi.com 9876543210 admin123 male
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ekgahoi';

async function createAdmin() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args.length < 5) {
      console.log('\n📝 Usage:');
      console.log('node backend/scripts/createAdmin.js <name> <email> <phone> <password> <gender>');
      console.log('\n📋 Example:');
      console.log('node backend/scripts/createAdmin.js "Admin User" admin@ekgahoi.com 9876543210 admin123 male');
      console.log('\n⚠️  Note: Email or Phone is required (one can be empty)');
      process.exit(1);
    }

    const [name, email, phone, password, gender] = args;

    if (!name || !password || !gender) {
      console.error('❌ Error: Name, password, and gender are required');
      process.exit(1);
    }

    if (!email && !phone) {
      console.error('❌ Error: Either email or phone is required');
      process.exit(1);
    }

    // Check if admin already exists with this email/phone
    const existingUser = await User.findOne({
      $or: [
        ...(email ? [{ email: email.toLowerCase().trim() }] : []),
        ...(phone ? [{ phone: phone.trim() }] : [])
      ]
    });

    if (existingUser) {
      // Update existing user to admin
      if (!existingUser.isAdmin) {
        existingUser.isAdmin = true;
        if (password) {
          existingUser.passwordHash = await bcrypt.hash(password, 10);
        }
        await existingUser.save();
        console.log(`✅ Updated existing user "${existingUser.name}" to admin`);
        console.log(`📧 Email: ${existingUser.email || 'N/A'}`);
        console.log(`📱 Phone: ${existingUser.phone || 'N/A'}`);
      } else {
        console.log(`⚠️  User "${existingUser.name}" is already an admin`);
      }
      await mongoose.disconnect();
      return;
    }

    // Create new admin user
    const passwordHash = await bcrypt.hash(password, 10);

    const adminUser = new User({
      name: name.trim(),
      email: email ? email.toLowerCase().trim() : undefined,
      phone: phone ? phone.trim() : undefined,
      passwordHash,
      gender,
      isAdmin: true,
      isActive: true,
      isProfileComplete: false,
    });

    await adminUser.save();

    console.log('\n✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👤 Name: ${adminUser.name}`);
    console.log(`📧 Email: ${adminUser.email || 'N/A'}`);
    console.log(`📱 Phone: ${adminUser.phone || 'N/A'}`);
    console.log(`🔐 Password: ${password}`);
    console.log(`👔 Gender: ${adminUser.gender}`);
    console.log(`✅ Admin Status: ${adminUser.isAdmin ? 'Yes' : 'No'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 You can now login with this admin account!');

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    if (error.code === 11000) {
      console.error('⚠️  A user with this email or phone already exists');
    }
    await mongoose.disconnect();
    process.exit(1);
  }
}

createAdmin();

