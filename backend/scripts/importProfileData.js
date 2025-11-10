/**
 * Import Profile Data Script
 * Maps external API profile data to our User model structure
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../src/models/User.js';
import { userService } from '../src/services/userService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '../.env') });

/**
 * Parse height string like "5ft 3 inch - 160 cm" to number (cm)
 */
function parseHeight(heightStr) {
  if (!heightStr) return null;
  
  // Extract cm value if present
  const cmMatch = heightStr.match(/(\d+)\s*cm/i);
  if (cmMatch) {
    return parseInt(cmMatch[1]);
  }
  
  // Extract feet and inches
  const feetMatch = heightStr.match(/(\d+)\s*ft/i);
  const inchMatch = heightStr.match(/(\d+)\s*inch/i);
  
  if (feetMatch && inchMatch) {
    const feet = parseInt(feetMatch[1]);
    const inches = parseInt(inchMatch[1]);
    return Math.round((feet * 30.48) + (inches * 2.54));
  }
  
  return null;
}

/**
 * Parse gender string like "Female / लड़की" to our format
 */
function parseGender(genderStr) {
  if (!genderStr) return 'other';
  const lower = genderStr.toLowerCase();
  if (lower.includes('male') && !lower.includes('fe')) return 'male';
  if (lower.includes('female') || lower.includes('लड़की')) return 'female';
  return 'other';
}

/**
 * Parse marital status
 */
function parseMaritalStatus(statusStr) {
  if (!statusStr) return 'unmarried';
  const lower = statusStr.toLowerCase();
  if (lower.includes('never') || lower.includes('अविवाहित')) return 'unmarried';
  if (lower.includes('divorced')) return 'divorced';
  if (lower.includes('widowed')) return 'widowed';
  if (lower.includes('separated')) return 'separated';
  return 'unmarried';
}

/**
 * Parse disability
 */
function parseDisability(disabilityStr) {
  if (!disabilityStr) return 'no';
  const lower = disabilityStr.toLowerCase();
  if (lower.includes('no') || lower.includes('नहीं')) return 'no';
  if (lower.includes('yes') || lower.includes('हाँ')) return 'yes';
  return 'not-specified';
}

/**
 * Parse profile created by
 */
function parseProfileCreatedBy(createdByStr) {
  if (!createdByStr) return 'self';
  const lower = createdByStr.toLowerCase();
  if (lower.includes('self') || lower.includes('स्वयं')) return 'self';
  if (lower.includes('family') || lower.includes('sibling') || lower.includes('parent')) return 'family';
  if (lower.includes('relative')) return 'relative';
  if (lower.includes('friend')) return 'friend';
  return 'self';
}

/**
 * Parse manglik status
 */
function parseManglikStatus(statusStr) {
  if (!statusStr) return null;
  const lower = statusStr.toLowerCase();
  if (lower.includes('manglik')) return 'manglik';
  if (lower.includes('angshik') || lower.includes('partial')) return 'angshik';
  if (lower.includes('non') || lower.includes('no')) return 'non-manglik';
  return null;
}

/**
 * Parse has house
 */
function parseHasHouse(hasHouseStr) {
  if (!hasHouseStr) return 'not-specified';
  const lower = hasHouseStr.toLowerCase();
  if (lower.includes('yes') && lower.includes('personal')) return 'yes-personal';
  if (lower.includes('yes') && lower.includes('rented')) return 'yes-rented';
  if (lower.includes('yes') || lower.includes('हाँ')) return 'yes-personal';
  if (lower.includes('no') || lower.includes('नहीं')) return 'no';
  return 'not-specified';
}

/**
 * Parse has car
 */
function parseHasCar(hasCarStr) {
  if (!hasCarStr) return false;
  const lower = String(hasCarStr).toLowerCase();
  if (lower.includes('yes') || lower.includes('हाँ')) return true;
  return false;
}

/**
 * Map external API data to our User model
 */
function mapProfileData(externalData) {
  const data = externalData.data || externalData;
  
  // Calculate age from date of birth
  let age = null;
  if (data.date_of_birth) {
    const dob = new Date(data.date_of_birth);
    const today = new Date();
    age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
  }
  
  // Parse height
  const height = parseHeight(data.height);
  
  // Build name from first_name and last_name
  const name = [data.first_name, data.last_name].filter(Boolean).join(' ').trim();
  
  // Map photos
  const photos = [];
  if (data.profile_picture_name) {
    // Assuming photos are stored in /uploads/photos/
    photos.push({
      url: `/uploads/photos/${data.profile_picture_name}`,
      isPrimary: true,
      order: 0
    });
  }
  
  // Map family data
  const family = {
    fathersName: data.father_name || null,
    fathersOccupation: data.father_occupation || null,
    fathersContactNumber: data.father_contact_number || null,
    mothersName: data.mother_name || null,
    mothersOccupation: data.mother_occupation || null,
    marriedBrothers: data.n_married_brother || 0,
    unmarriedBrothers: data.n_unmarried_brother || 0,
    marriedSisters: data.n_married_sister || 0,
    unmarriedSisters: data.n_unmarried_sister || 0,
    maternalUncleName: data.maternal_uncle_name || null,
    maternalUncleAakna: data.maternal_uncle_aakna || null,
  };
  
  // Map horoscope details
  const horoscopeDetails = {
    starSign: data.zodiac ? data.zodiac.split(' / ')[0] : null,
    rashi: data.zodiac ? data.zodiac.split(' / ')[0] : null, // Using zodiac as rashi if available
    nakshatra: data.nakshatra || null,
    aakna: data.aakna || null,
    manglikStatus: parseManglikStatus(data.manglik_status),
    timeOfBirth: data.time_of_birth || null,
    placeOfBirth: data.place_of_birth || null,
  };
  
  // Map user data
  const userData = {
    // Use profile_id as gahoiId if it's in the 10000-10099 range, otherwise generate
    gahoiId: (data.profile_id >= 10000 && data.profile_id <= 10099) ? data.profile_id : null,
    name: name || 'Unknown',
    gender: parseGender(data.gender),
    dateOfBirth: data.date_of_birth ? new Date(data.date_of_birth) : null,
    age: age || data.age || null,
    maritalStatus: parseMaritalStatus(data.marital_status),
    height: height,
    weight: data.weight || null,
    complexion: data.complexion ? data.complexion.toLowerCase().replace(/\s+/g, '-') : 'not-specified',
    bloodGroup: data.blood_group || null,
    disability: parseDisability(data.disability),
    profileCreatedBy: parseProfileCreatedBy(data.profile_created_by),
    city: data.city_name || null,
    state: data.state_name || null,
    country: data.country_name || 'India',
    town: data.town || null,
    religion: data.religion || null,
    gotra: data.gotra || null,
    motherTongue: data.mother_tongue || null,
    horoscopeDetails: horoscopeDetails,
    education: data.education || null,
    educationalDetail: data.educational_detail || null,
    occupation: data.occupation || null,
    profession: data.profession || null,
    employer: data.occupation_detail ? data.occupation_detail.split(' at ')[1] || null : null,
    occupationDetail: data.occupation_detail || null,
    annualIncome: data.annual_income || null,
    family: family,
    diet: data.dietary_habit ? (data.dietary_habit.toLowerCase().includes('veg') ? 'vegetarian' : 'non-vegetarian') : null,
    dietaryHabit: data.dietary_habit || null,
    partnerPreference: data.partner_preference || null,
    hasHouse: parseHasHouse(data.has_house),
    hasCar: parseHasCar(data.has_car),
    bio: data.about_myself || null,
    photos: photos,
    isActive: data.status === 'Active',
    isProfileComplete: true,
    mobileCountryCode: data.mobile_no_country_code || 91,
  };
  
  // Add phone if available (you may need to construct it from mobile_no and country_code)
  if (data.mobile_no) {
    userData.phone = String(data.mobile_no);
  }
  
  // Add WhatsApp number if available
  if (data.whatsapp_mobile_no) {
    userData.whatsappNumber = String(data.whatsapp_mobile_no);
  }
  
  return userData;
}

/**
 * Import a single profile
 */
async function importProfile(externalData) {
  try {
    const userData = mapProfileData(externalData);
    
    // Check if user already exists (by gahoiId or phone)
    let existingUser = null;
    if (userData.gahoiId) {
      existingUser = await User.findOne({ gahoiId: userData.gahoiId });
    }
    if (!existingUser && userData.phone) {
      existingUser = await User.findOne({ phone: userData.phone });
    }
    
    if (existingUser) {
      // Update existing user
      Object.assign(existingUser, userData);
      await existingUser.save();
      console.log(`✅ Updated: ${userData.name} (Gahoi ID: ${userData.gahoiId || 'N/A'})`);
      return { action: 'updated', user: existingUser };
    } else {
      // Create new user
      const user = await userService.createUser(userData);
      console.log(`✅ Created: ${userData.name} (Gahoi ID: ${user.gahoiId || 'N/A'})`);
      return { action: 'created', user };
    }
  } catch (error) {
    console.error(`❌ Error importing profile:`, error.message);
    throw error;
  }
}

/**
 * Import multiple profiles from an array
 */
async function importProfiles(profilesArray) {
  const results = {
    created: [],
    updated: [],
    errors: []
  };
  
  for (const profileData of profilesArray) {
    try {
      const result = await importProfile(profileData);
      if (result.action === 'created') {
        results.created.push(result.user);
      } else {
        results.updated.push(result.user);
      }
    } catch (error) {
      results.errors.push({
        data: profileData,
        error: error.message
      });
    }
  }
  
  return results;
}

// Example usage
async function main() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/matrimonial';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Example: Import a single profile
    const exampleProfile = {
      "code": 200,
      "msg": "success",
      "data": {
        "profile_id": 19811,
        "first_name": "Shalini",
        "last_name": "Gupta",
        "gender": "Female / लड़की",
        // ... (rest of the data)
      }
    };
    
    // Uncomment to import:
    // const result = await importProfile(exampleProfile);
    // console.log('Import result:', result);
    
    // Or import from an array:
    // const profiles = [profile1, profile2, ...];
    // const results = await importProfiles(profiles);
    // console.log(`Created: ${results.created.length}, Updated: ${results.updated.length}, Errors: ${results.errors.length}`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { importProfile, importProfiles, mapProfileData };

