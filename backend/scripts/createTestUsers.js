/**
 * Create Test Users Script
 * Generates test user profiles with general Indian names and realistic data
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '../.env') });

import { userService } from '../src/services/userService.js';

// General Indian names for test data
const maleNames = [
  'Rajesh Kumar', 'Amit Sharma', 'Rahul Gupta', 'Priyank Patel', 'Vikram Singh',
  'Suresh Jain', 'Kiran Mehta', 'Anil Shah', 'Manish Agarwal', 'Nikhil Desai',
  'Ajay Verma', 'Pankaj Trivedi', 'Mohit Malhotra', 'Arjun Reddy', 'Rohit Joshi',
  'Karan Nair', 'Siddharth Iyer', 'Varun Menon', 'Aditya Rao', 'Karthik Nair'
];

const femaleNames = [
  'Priya Sharma', 'Anjali Patel', 'Neha Gupta', 'Shreya Singh', 'Kavya Reddy',
  'Divya Iyer', 'Meera Nair', 'Aditi Shah', 'Pooja Jain', 'Sneha Agarwal',
  'Richa Verma', 'Aarti Trivedi', 'Shruti Malhotra', 'Riya Joshi', 'Ananya Rao',
  'Isha Menon', 'Tanvi Desai', 'Kruti Mehta', 'Disha Shah', 'Nisha Patel'
];

const religions = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain'];
const castes = ['Brahmin', 'Kshatriya', 'Vaishya', 'Shudra', 'Jain', 'Muslim'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'];
const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'West Bengal', 'Gujarat'];
const occupations = [
  'software-engineer', 'doctor', 'engineer', 'teacher', 'lawyer', 'ca',
  'business', 'government', 'banking', 'marketing', 'hr'
];
const educations = [
  'graduate', 'btech', 'mba', 'mtech', 'mca', 'bca', 'bcom', 'mcom',
  'bsc', 'msc', 'bba', 'mbb', 'phd'
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
  // Males: 25-35, Females: 22-32 (typical marriage age range)
  if (gender === 'male') {
    return Math.floor(Math.random() * 11) + 25;
  } else {
    return Math.floor(Math.random() * 11) + 22;
  }
}

function generatePhoneNumber(index) {
  // Generate unique phone numbers starting from 9000000000
  return String(9000000000 + index);
}

async function createTestUsers() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/matrimonial';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const usersToCreate = [];
    let phoneIndex = 100; // Start from 100 to avoid conflicts

    // Create 10 male users
    for (let i = 0; i < 10; i++) {
      const name = getRandomElement(maleNames);
      const phone = generatePhoneNumber(phoneIndex++);
      const age = getRandomAge('male');
      const state = getRandomElement(states);
      const city = getRandomElement(cities);
      const rashi = getRandomElement(rashis);
      const nakshatra = getRandomElement(nakshatras);

      usersToCreate.push({
        name,
        phone,
        gender: 'male',
        age,
        country: 'India',
        state,
        city,
        religion: getRandomElement(religions),
        education: getRandomElement(educations),
        occupation: getRandomElement(occupations),
        maritalStatus: 'unmarried',
        height: Math.floor(Math.random() * 15) + 165, // 165-180 cm
        complexion: getRandomElement(['fair', 'wheatish', 'very-fair']),
        bio: `Hello! I am ${name}, a ${age}-year-old professional from ${city}, ${state}. Looking for a compatible life partner.`,
        horoscopeDetails: {
          rashi,
          nakshatra,
          starSign: rashi
        },
        isActive: true,
      });
    }

    // Create 10 female users
    for (let i = 0; i < 10; i++) {
      const name = getRandomElement(femaleNames);
      const phone = generatePhoneNumber(phoneIndex++);
      const age = getRandomAge('female');
      const state = getRandomElement(states);
      const city = getRandomElement(cities);
      const rashi = getRandomElement(rashis);
      const nakshatra = getRandomElement(nakshatras);

      usersToCreate.push({
        name,
        phone,
        gender: 'female',
        age,
        country: 'India',
        state,
        city,
        religion: getRandomElement(religions),
        education: getRandomElement(educations),
        occupation: getRandomElement(occupations),
        maritalStatus: 'unmarried',
        height: Math.floor(Math.random() * 15) + 150, // 150-165 cm
        complexion: getRandomElement(['fair', 'wheatish', 'very-fair']),
        bio: `Namaste! I am ${name}, ${age} years old, from ${city}, ${state}. Seeking a life partner for a happy and harmonious marriage.`,
        horoscopeDetails: {
          rashi,
          nakshatra,
          starSign: rashi
        },
        isActive: true,
      });
    }

    console.log(`\n📝 Creating ${usersToCreate.length} test users...\n`);

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
          id: user._id
        });
        console.log(`✅ Created: ${user.name} (${user.phone})`);
      } catch (error) {
        if (error.status === 409) {
          console.log(`⚠️  Skipped (already exists): ${userData.name} (${userData.phone})`);
        } else {
          results.errors.push({
            name: userData.name,
            error: error.message
          });
          console.log(`❌ Error creating ${userData.name}: ${error.message}`);
        }
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Successfully created: ${results.created.length} users`);
    console.log(`❌ Errors: ${results.errors.length}`);
    
    if (results.created.length > 0) {
      console.log(`\n📋 Created Users:`);
      results.created.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} - Phone: ${user.phone}`);
      });
    }

    console.log('\n✨ Test users creation completed!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
createTestUsers();

