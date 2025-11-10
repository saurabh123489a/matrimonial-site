/**
 * Assign Gahoi IDs to Existing Users
 * Gahoi ID format: 5 digits starting with 1000
 * Even numbers = Male, Odd numbers = Female
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '../.env') });

import User from '../src/models/User.js';

function generateGahoiId(gender, index) {
  // Gahoi ID: 5 digits starting with 1000
  // Even numbers (10000, 10002, ...) = Male
  // Odd numbers (10001, 10003, ...) = Female
  const baseId = 10000;
  if (gender === 'male') {
    // Even: 10000, 10002, 10004, ...
    return baseId + (index * 2);
  } else {
    // Odd: 10001, 10003, 10005, ...
    return baseId + (index * 2) + 1;
  }
}

async function assignGahoiIds() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/matrimonial';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get all users, sorted by creation date
    const users = await User.find({}).sort({ createdAt: 1 }).exec();
    console.log(`📊 Found ${users.length} users to process\n`);

    // Separate users by gender
    const maleUsers = users.filter(u => u.gender === 'male');
    const femaleUsers = users.filter(u => u.gender === 'female');
    const otherUsers = users.filter(u => !u.gender || (u.gender !== 'male' && u.gender !== 'female'));

    console.log(`👨 Males: ${maleUsers.length}`);
    console.log(`👩 Females: ${femaleUsers.length}`);
    if (otherUsers.length > 0) {
      console.log(`⚧️  Other: ${otherUsers.length}`);
    }
    console.log('');

    const results = {
      updated: [],
      skipped: [],
      errors: []
    };

    let maleIndex = 0;
    let femaleIndex = 0;

    // Process male users
    for (const user of maleUsers) {
      try {
        // Skip if already has a Gahoi ID
        if (user.gahoiId) {
          console.log(`⚠️  Skipped (already has Gahoi ID): ${user.name} (Gahoi ID: ${user.gahoiId})`);
          results.skipped.push({
            name: user.name,
            gahoiId: user.gahoiId,
            reason: 'Already has Gahoi ID'
          });
          continue;
        }

        const gahoiId = generateGahoiId('male', maleIndex++);
        
        // Check if this Gahoi ID already exists
        const existing = await User.findOne({ gahoiId });
        if (existing && existing._id.toString() !== user._id.toString()) {
          console.log(`⚠️  Gahoi ID ${gahoiId} already exists, skipping ${user.name}`);
          results.skipped.push({
            name: user.name,
            gahoiId: gahoiId,
            reason: 'Gahoi ID already exists'
          });
          maleIndex--; // Don't increment for next user
          continue;
        }

        user.gahoiId = gahoiId;
        await user.save();
        
        results.updated.push({
          name: user.name,
          gender: user.gender,
          gahoiId: gahoiId,
          id: user._id
        });
        console.log(`✅ Assigned Gahoi ID ${gahoiId} to ${user.name} (Male)`);
      } catch (error) {
        console.error(`❌ Error updating ${user.name}:`, error.message);
        results.errors.push({
          name: user.name,
          error: error.message
        });
      }
    }

    // Process female users
    for (const user of femaleUsers) {
      try {
        // Skip if already has a Gahoi ID
        if (user.gahoiId) {
          console.log(`⚠️  Skipped (already has Gahoi ID): ${user.name} (Gahoi ID: ${user.gahoiId})`);
          results.skipped.push({
            name: user.name,
            gahoiId: user.gahoiId,
            reason: 'Already has Gahoi ID'
          });
          continue;
        }

        const gahoiId = generateGahoiId('female', femaleIndex++);
        
        // Check if this Gahoi ID already exists
        const existing = await User.findOne({ gahoiId });
        if (existing && existing._id.toString() !== user._id.toString()) {
          console.log(`⚠️  Gahoi ID ${gahoiId} already exists, skipping ${user.name}`);
          results.skipped.push({
            name: user.name,
            gahoiId: gahoiId,
            reason: 'Gahoi ID already exists'
          });
          femaleIndex--; // Don't increment for next user
          continue;
        }

        user.gahoiId = gahoiId;
        await user.save();
        
        results.updated.push({
          name: user.name,
          gender: user.gender,
          gahoiId: gahoiId,
          id: user._id
        });
        console.log(`✅ Assigned Gahoi ID ${gahoiId} to ${user.name} (Female)`);
      } catch (error) {
        console.error(`❌ Error updating ${user.name}:`, error.message);
        results.errors.push({
          name: user.name,
          error: error.message
        });
      }
    }

    // Process other gender users (assign even numbers like males)
    for (const user of otherUsers) {
      try {
        if (user.gahoiId) {
          console.log(`⚠️  Skipped (already has Gahoi ID): ${user.name} (Gahoi ID: ${user.gahoiId})`);
          results.skipped.push({
            name: user.name,
            gahoiId: user.gahoiId,
            reason: 'Already has Gahoi ID'
          });
          continue;
        }

        // Assign even numbers for other genders (starting after males)
        const gahoiId = 10000 + (maleUsers.length * 2) + (otherUsers.indexOf(user) * 2);
        
        const existing = await User.findOne({ gahoiId });
        if (existing && existing._id.toString() !== user._id.toString()) {
          console.log(`⚠️  Gahoi ID ${gahoiId} already exists, skipping ${user.name}`);
          results.skipped.push({
            name: user.name,
            gahoiId: gahoiId,
            reason: 'Gahoi ID already exists'
          });
          continue;
        }

        user.gahoiId = gahoiId;
        await user.save();
        
        results.updated.push({
          name: user.name,
          gender: user.gender || 'other',
          gahoiId: gahoiId,
          id: user._id
        });
        console.log(`✅ Assigned Gahoi ID ${gahoiId} to ${user.name} (Other)`);
      } catch (error) {
        console.error(`❌ Error updating ${user.name}:`, error.message);
        results.errors.push({
          name: user.name,
          error: error.message
        });
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Successfully assigned: ${results.updated.length} Gahoi IDs`);
    console.log(`⚠️  Skipped: ${results.skipped.length} users`);
    console.log(`❌ Errors: ${results.errors.length}`);
    
    if (results.updated.length > 0) {
      console.log(`\n📋 Updated Users (First 10):`);
      results.updated.slice(0, 10).forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} - Gahoi ID: ${user.gahoiId} (${user.gender})`);
      });
      if (results.updated.length > 10) {
        console.log(`   ... and ${results.updated.length - 10} more`);
      }
    }

    if (results.errors.length > 0) {
      console.log(`\n❌ Errors:`);
      results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.name}: ${error.error}`);
      });
    }

    console.log('\n✨ Gahoi ID assignment completed!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
assignGahoiIds();

