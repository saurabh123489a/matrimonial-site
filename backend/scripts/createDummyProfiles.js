/**
 * Create 50 Dummy Profiles Script
 * Generates 50 user profiles with Gahoi IDs
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

import { userService } from '../src/services/userService.js';

// Indian names for test data
const maleNames = [
  'Rajesh Kumar', 'Amit Sharma', 'Rahul Gupta', 'Priyank Patel', 'Vikram Singh',
  'Suresh Jain', 'Kiran Mehta', 'Anil Shah', 'Manish Agarwal', 'Nikhil Desai',
  'Ajay Verma', 'Pankaj Trivedi', 'Mohit Malhotra', 'Arjun Reddy', 'Rohit Joshi',
  'Karan Nair', 'Siddharth Iyer', 'Varun Menon', 'Aditya Rao', 'Karthik Nair',
  'Ravi Kumar', 'Deepak Sharma', 'Sunil Patel', 'Amitabh Singh', 'Vivek Jain',
  'Ramesh Mehta', 'Suresh Shah', 'Rajesh Agarwal', 'Nitin Desai', 'Pramod Verma'
];

const femaleNames = [
  'Priya Sharma', 'Anjali Patel', 'Neha Gupta', 'Shreya Singh', 'Kavya Reddy',
  'Divya Iyer', 'Meera Nair', 'Aditi Shah', 'Pooja Jain', 'Sneha Agarwal',
  'Richa Verma', 'Aarti Trivedi', 'Shruti Malhotra', 'Riya Joshi', 'Ananya Rao',
  'Isha Menon', 'Tanvi Desai', 'Kruti Mehta', 'Disha Shah', 'Nisha Patel',
  'Kavita Kumar', 'Sunita Sharma', 'Rekha Patel', 'Manju Singh', 'Sarita Jain',
  'Geeta Mehta', 'Lata Shah', 'Usha Agarwal', 'Rekha Desai', 'Suman Verma'
];

const religions = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain'];
const castes = ['Brahmin', 'Kshatriya', 'Vaishya', 'Shudra', 'Jain', 'Muslim'];
const subCastes = ['Agarwal', 'Gupta', 'Sharma', 'Patel', 'Reddy', 'Iyer', 'Nair', 'Jain'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat'];
const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'West Bengal', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Punjab'];
const occupations = [
  'Software Engineer', 'Doctor', 'Engineer', 'Teacher', 'Lawyer', 'CA',
  'Business Owner', 'Government Employee', 'Banking Professional', 'Marketing Manager', 'HR Manager',
  'Architect', 'Designer', 'Accountant', 'Consultant', 'Manager'
];
const educations = [
  'Graduate', 'B.Tech', 'MBA', 'M.Tech', 'MCA', 'BCA', 'B.Com', 'M.Com',
  'B.Sc', 'M.Sc', 'BBA', 'MBBS', 'Ph.D', 'B.E', 'M.E'
];
const complexions = ['very-fair', 'fair', 'wheatish', 'dark'];
const diets = ['vegetarian', 'non-vegetarian', 'vegan', 'jain'];
const hobbies = [
  ['Reading', 'Traveling', 'Music'],
  ['Cooking', 'Dancing', 'Photography'],
  ['Sports', 'Gaming', 'Movies'],
  ['Yoga', 'Meditation', 'Art'],
  ['Singing', 'Dancing', 'Writing']
];

const rashis = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const nakshatras = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta',
  'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomAge(gender) {
  // Males: 25-40, Females: 22-35 (typical marriage age range)
  if (gender === 'male') {
    return Math.floor(Math.random() * 16) + 25;
  } else {
    return Math.floor(Math.random() * 14) + 22;
  }
}

function generatePhoneNumber(index) {
  // Generate unique phone numbers starting from 9000000000
  return String(9000000000 + index);
}

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

async function createDummyProfiles() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/matrimonial';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    const usersToCreate = [];
    let phoneIndex = 200; // Start from 200 to avoid conflicts
    let maleIndex = 0;
    let femaleIndex = 0;

    // Create 25 male users
    for (let i = 0; i < 25; i++) {
      const name = getRandomElement(maleNames);
      const phone = generatePhoneNumber(phoneIndex++);
      const age = getRandomAge('male');
      const state = getRandomElement(states);
      const city = getRandomElement(cities);
      const rashi = getRandomElement(rashis);
      const nakshatra = getRandomElement(nakshatras);
      const gahoiId = generateGahoiId('male', maleIndex++);

      usersToCreate.push({
        name,
        phone,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}${phoneIndex}@example.com`,
        gender: 'male',
        age,
        gahoiId,
        country: 'India',
        state,
        city,
        religion: getRandomElement(religions),
        caste: getRandomElement(castes),
        subCaste: getRandomElement(subCastes),
        education: getRandomElement(educations),
        occupation: getRandomElement(occupations),
        maritalStatus: 'unmarried',
        height: Math.floor(Math.random() * 15) + 165, // 165-180 cm
        weight: Math.floor(Math.random() * 20) + 65, // 65-85 kg
        complexion: getRandomElement(complexions),
        diet: getRandomElement(diets),
        smoking: Math.random() < 0.1, // 10% smokers
        drinking: Math.random() < 0.15, // 15% drinkers
        hobbies: getRandomElement(hobbies),
        bio: `Hello! I am ${name}, a ${age}-year-old ${getRandomElement(occupations)} from ${city}, ${state}. I am looking for a compatible life partner who shares similar values and interests.`,
        horoscopeDetails: {
          rashi,
          nakshatra,
          starSign: rashi
        },
        isActive: true,
      });
    }

    // Create 25 female users
    for (let i = 0; i < 25; i++) {
      const name = getRandomElement(femaleNames);
      const phone = generatePhoneNumber(phoneIndex++);
      const age = getRandomAge('female');
      const state = getRandomElement(states);
      const city = getRandomElement(cities);
      const rashi = getRandomElement(rashis);
      const nakshatra = getRandomElement(nakshatras);
      const gahoiId = generateGahoiId('female', femaleIndex++);

      usersToCreate.push({
        name,
        phone,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}${phoneIndex}@example.com`,
        gender: 'female',
        age,
        gahoiId,
        country: 'India',
        state,
        city,
        religion: getRandomElement(religions),
        caste: getRandomElement(castes),
        subCaste: getRandomElement(subCastes),
        education: getRandomElement(educations),
        occupation: getRandomElement(occupations),
        maritalStatus: 'unmarried',
        height: Math.floor(Math.random() * 15) + 150, // 150-165 cm
        weight: Math.floor(Math.random() * 15) + 50, // 50-65 kg
        complexion: getRandomElement(complexions),
        diet: getRandomElement(diets),
        smoking: Math.random() < 0.05, // 5% smokers
        drinking: Math.random() < 0.08, // 8% drinkers
        hobbies: getRandomElement(hobbies),
        bio: `Namaste! I am ${name}, ${age} years old, working as a ${getRandomElement(occupations)} in ${city}, ${state}. I am seeking a life partner for a happy and harmonious marriage based on mutual respect and understanding.`,
        horoscopeDetails: {
          rashi,
          nakshatra,
          starSign: rashi
        },
        isActive: true,
      });
    }

    console.log(`📝 Creating ${usersToCreate.length} dummy profiles...\n`);

    const results = {
      created: [],
      errors: []
    };

    // Create users one by one to handle duplicates gracefully
    for (const userData of usersToCreate) {
      try {
        const user = await userService.createUser(userData);
        results.created.push({
          name: user.name,
          phone: user.phone,
          gahoiId: user.gahoiId,
          gender: user.gender,
          id: user._id
        });
        console.log(`✅ Created: ${user.name} (Gahoi ID: ${user.gahoiId}, ${user.gender})`);
      } catch (error) {
        if (error.status === 409) {
          console.log(`⚠️  Skipped (already exists): ${userData.name} (Gahoi ID: ${userData.gahoiId})`);
        } else {
          results.errors.push({
            name: userData.name,
            gahoiId: userData.gahoiId,
            error: error.message
          });
          console.log(`❌ Error creating ${userData.name} (Gahoi ID: ${userData.gahoiId}): ${error.message}`);
        }
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Successfully created: ${results.created.length} profiles`);
    console.log(`❌ Errors: ${results.errors.length}`);
    
    if (results.created.length > 0) {
      console.log(`\n📋 Created Profiles (First 10):`);
      results.created.slice(0, 10).forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} - Gahoi ID: ${user.gahoiId} (${user.gender})`);
      });
      if (results.created.length > 10) {
        console.log(`   ... and ${results.created.length - 10} more`);
      }
    }

    if (results.errors.length > 0) {
      console.log(`\n❌ Errors:`);
      results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.name} (Gahoi ID: ${error.gahoiId}): ${error.error}`);
      });
    }

    console.log('\n✨ Dummy profiles creation completed!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
createDummyProfiles();

