/**
 * Fix Old Profiles Script
 * Checks and fixes issues with existing profiles:
 * - Missing required fields
 * - Invalid data formats
 * - Missing Gahoi IDs
 * - Profile completeness issues
 * - Data consistency issues
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
  const baseId = 10000;
  if (gender === 'male') {
    return baseId + (index * 2); // Even: 10000, 10002, ...
  } else {
    return baseId + (index * 2) + 1; // Odd: 10001, 10003, ...
  }
}

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function convertHeightToInches(height) {
  // If height is already in inches (reasonable range 50-80), return as is
  if (height && height >= 50 && height <= 80) {
    return height;
  }
  // If height is in cm (reasonable range 120-200), convert to inches
  if (height && height >= 120 && height <= 200) {
    return Math.round(height / 2.54);
  }
  // If height is already reasonable, return as is
  return height;
}

async function fixOldProfiles() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/matrimonial';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Find all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} total profiles\n`);

    const issues = {
      missingGahoiId: [],
      missingName: [],
      missingGender: [],
      invalidAge: [],
      missingDateOfBirth: [],
      heightInCm: [],
      missingLocation: [],
      incompleteProfiles: [],
      fixed: [],
      errors: []
    };

    // Get all existing Gahoi IDs to avoid conflicts
    const existingGahoiIds = new Set();
    users.forEach(u => {
      if (u.gahoiId) {
        existingGahoiIds.add(u.gahoiId);
      }
    });

    // Find the highest Gahoi ID to continue from there
    let maxGahoiId = 10000;
    existingGahoiIds.forEach(id => {
      if (id > maxGahoiId) {
        maxGahoiId = id;
      }
    });

    // Calculate starting indices based on existing IDs
    let maleIndex = 0;
    let femaleIndex = 0;
    existingGahoiIds.forEach(id => {
      if (id % 2 === 0) {
        // Even = male
        const index = (id - 10000) / 2;
        if (index >= maleIndex) maleIndex = index + 1;
      } else {
        // Odd = female
        const index = (id - 10001) / 2;
        if (index >= femaleIndex) femaleIndex = index + 1;
      }
    });

    for (const user of users) {
      const updates = {};
      let needsUpdate = false;
      const userIssues = [];

      try {
        // Check and fix Gahoi ID
        if (!user.gahoiId) {
          if (user.gender === 'male') {
            let newGahoiId;
            let attempts = 0;
            // Find next available male Gahoi ID
            do {
              newGahoiId = generateGahoiId('male', maleIndex++);
              attempts++;
              if (attempts > 100) {
                throw new Error('Could not find available Gahoi ID after 100 attempts');
              }
            } while (existingGahoiIds.has(newGahoiId));
            
            updates.gahoiId = newGahoiId;
            existingGahoiIds.add(newGahoiId);
            userIssues.push('Missing Gahoi ID');
            issues.missingGahoiId.push({ id: user._id, name: user.name });
          } else if (user.gender === 'female') {
            let newGahoiId;
            let attempts = 0;
            // Find next available female Gahoi ID
            do {
              newGahoiId = generateGahoiId('female', femaleIndex++);
              attempts++;
              if (attempts > 100) {
                throw new Error('Could not find available Gahoi ID after 100 attempts');
              }
            } while (existingGahoiIds.has(newGahoiId));
            
            updates.gahoiId = newGahoiId;
            existingGahoiIds.add(newGahoiId);
            userIssues.push('Missing Gahoi ID');
            issues.missingGahoiId.push({ id: user._id, name: user.name });
          } else {
            userIssues.push('Cannot assign Gahoi ID - missing gender');
            issues.errors.push({ id: user._id, name: user.name, error: 'Missing gender for Gahoi ID assignment' });
          }
        }

        // Check required fields
        if (!user.name || user.name.trim() === '') {
          userIssues.push('Missing name');
          issues.missingName.push({ id: user._id, name: user.name || 'N/A' });
        }

        if (!user.gender) {
          userIssues.push('Missing gender');
          issues.missingGender.push({ id: user._id, name: user.name });
        }

        // Fix age if missing but dateOfBirth exists
        if (!user.age && user.dateOfBirth) {
          const calculatedAge = calculateAge(user.dateOfBirth);
          if (calculatedAge && calculatedAge >= 18 && calculatedAge <= 100) {
            updates.age = calculatedAge;
            userIssues.push('Fixed age from dateOfBirth');
            needsUpdate = true;
          }
        }

        // Fix dateOfBirth if missing but age exists (approximate)
        if (!user.dateOfBirth && user.age) {
          const currentYear = new Date().getFullYear();
          const birthYear = currentYear - user.age;
          // Set to January 1st of birth year (approximate)
          updates.dateOfBirth = new Date(birthYear, 0, 1);
          userIssues.push('Added approximate dateOfBirth from age');
          needsUpdate = true;
        }

        // Convert height from cm to inches if needed
        if (user.height) {
          const heightInInches = convertHeightToInches(user.height);
          if (heightInInches !== user.height) {
            updates.height = heightInInches;
            userIssues.push(`Converted height from ${user.height}cm to ${heightInInches} inches`);
            issues.heightInCm.push({ id: user._id, name: user.name, oldHeight: user.height, newHeight: heightInInches });
            needsUpdate = true;
          }
        }

        // Check location fields
        if (!user.city && !user.state) {
          userIssues.push('Missing location');
          issues.missingLocation.push({ id: user._id, name: user.name });
          // Try to set default values if completely missing
          if (!user.city) {
            updates.city = 'Not Specified';
            userIssues.push('Added default city');
            needsUpdate = true;
          }
          if (!user.state) {
            updates.state = 'Not Specified';
            userIssues.push('Added default state');
            needsUpdate = true;
          }
        }

        // Set default country if missing
        if (!user.country) {
          updates.country = 'India';
          userIssues.push('Added default country');
          needsUpdate = true;
        }

        // Check profile completeness
        const completenessFields = [
          'name', 'gender', 'age', 'city', 'state', 'education', 'occupation'
        ];
        const missingFields = completenessFields.filter(field => !user[field]);
        
        if (missingFields.length > 0) {
          issues.incompleteProfiles.push({
            id: user._id,
            name: user.name,
            missingFields
          });
        }

        // Set isProfileComplete flag
        const hasRequiredFields = user.name && user.gender && user.age && user.city && user.state;
        if (hasRequiredFields && !user.isProfileComplete) {
          updates.isProfileComplete = true;
          userIssues.push('Marked profile as complete');
          needsUpdate = true;
        } else if (!hasRequiredFields && user.isProfileComplete) {
          updates.isProfileComplete = false;
          userIssues.push('Unmarked profile as incomplete');
          needsUpdate = true;
        }

        // Set isActive if missing
        if (user.isActive === undefined || user.isActive === null) {
          updates.isActive = true;
          userIssues.push('Set isActive to true');
          needsUpdate = true;
        }

        // Update if needed
        if (Object.keys(updates).length > 0) {
          needsUpdate = true;
        }

        if (needsUpdate) {
          await User.updateOne({ _id: user._id }, { $set: updates });
          issues.fixed.push({
            id: user._id,
            name: user.name,
            updates: Object.keys(updates),
            issues: userIssues
          });
          console.log(`✅ Fixed: ${user.name} (${user._id}) - ${userIssues.join(', ')}`);
        } else if (userIssues.length > 0) {
          console.log(`⚠️  Issues found but cannot auto-fix: ${user.name} (${user._id}) - ${userIssues.join(', ')}`);
        }

      } catch (error) {
        issues.errors.push({
          id: user._id,
          name: user.name,
          error: error.message
        });
        console.error(`❌ Error processing ${user.name} (${user._id}):`, error.message);
      }
    }

    // Print summary
    console.log('\n📊 Summary:');
    console.log(`✅ Fixed: ${issues.fixed.length} profiles`);
    console.log(`⚠️  Missing Gahoi ID: ${issues.missingGahoiId.length}`);
    console.log(`⚠️  Missing Name: ${issues.missingName.length}`);
    console.log(`⚠️  Missing Gender: ${issues.missingGender.length}`);
    console.log(`⚠️  Invalid Age: ${issues.invalidAge.length}`);
    console.log(`⚠️  Missing Date of Birth: ${issues.missingDateOfBirth.length}`);
    console.log(`⚠️  Height converted (cm to inches): ${issues.heightInCm.length}`);
    console.log(`⚠️  Missing Location: ${issues.missingLocation.length}`);
    console.log(`⚠️  Incomplete Profiles: ${issues.incompleteProfiles.length}`);
    console.log(`❌ Errors: ${issues.errors.length}`);

    if (issues.fixed.length > 0) {
      console.log('\n📋 Fixed Profiles (First 10):');
      issues.fixed.slice(0, 10).forEach((fixed, index) => {
        console.log(`   ${index + 1}. ${fixed.name} - Fixed: ${fixed.updates.join(', ')}`);
      });
      if (issues.fixed.length > 10) {
        console.log(`   ... and ${issues.fixed.length - 10} more`);
      }
    }

    if (issues.missingGahoiId.length > 0) {
      console.log('\n⚠️  Profiles Missing Gahoi ID:');
      issues.missingGahoiId.slice(0, 10).forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.name || 'N/A'} (${profile.id})`);
      });
      if (issues.missingGahoiId.length > 10) {
        console.log(`   ... and ${issues.missingGahoiId.length - 10} more`);
      }
    }

    if (issues.incompleteProfiles.length > 0) {
      console.log('\n⚠️  Incomplete Profiles:');
      issues.incompleteProfiles.slice(0, 10).forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.name} - Missing: ${profile.missingFields.join(', ')}`);
      });
      if (issues.incompleteProfiles.length > 10) {
        console.log(`   ... and ${issues.incompleteProfiles.length - 10} more`);
      }
    }

    if (issues.errors.length > 0) {
      console.log('\n❌ Errors:');
      issues.errors.slice(0, 10).forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.name} (${error.id}): ${error.error}`);
      });
      if (issues.errors.length > 10) {
        console.log(`   ... and ${issues.errors.length - 10} more`);
      }
    }

    console.log('\n✨ Profile fix completed!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
fixOldProfiles();

