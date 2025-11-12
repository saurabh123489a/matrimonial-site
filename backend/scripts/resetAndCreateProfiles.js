/**
 * Reset Database and Create 50 Complete Profiles
 * This script:
 * 1. Deletes ALL existing users
 * 2. Creates 50 new profiles with COMPLETE details
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

const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat'];
const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'West Bengal', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Punjab'];
const towns = ['Andheri', 'Dwarka', 'Whitefield', 'Gachibowli', 'Anna Nagar', 'Koregaon Park', 'Salt Lake', 'Vastrapur', 'Malviya Nagar', 'Athwa'];
const pincodes = ['400053', '110075', '560066', '500032', '600040', '411001', '700091', '380015', '302017', '395001'];

const occupations = [
  'Software Engineer', 'Doctor', 'Engineer', 'Teacher', 'Lawyer', 'CA',
  'Business Owner', 'Government Employee', 'Banking Professional', 'Marketing Manager', 'HR Manager',
  'Architect', 'Designer', 'Accountant', 'Consultant', 'Manager', 'Home Maker / House Wife'
];

const professions = [
  'Computer Software Professional', 'Medical Professional', 'Engineering Professional',
  'Education Professional', 'Legal Professional', 'Chartered Accountant',
  'Business Professional', 'Government Service', 'Banking Professional',
  'Marketing Professional', 'Human Resources Professional', 'Architecture Professional',
  'Design Professional', 'Accounting Professional', 'Management Consultant', 'Home Maker'
];

const educations = [
  'Graduate', 'B.Tech', 'MBA', 'M.Tech', 'MCA', 'BCA', 'B.Com', 'M.Com',
  'B.Sc', 'M.Sc', 'BBA', 'MBBS', 'Ph.D', 'B.E', 'M.E', 'B.A', 'M.A'
];

const educationalDetails = ['Graduate', 'Post Graduate', 'Doctorate', 'Diploma'];
const fieldsOfStudy = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Commerce', 'Arts', 'Science', 'Medicine', 'Law', 'Management'];

const employers = [
  'TCS', 'Infosys', 'Wipro', 'HCL', 'Tech Mahindra', 'Microsoft', 'Google', 'Amazon',
  'Reliance', 'Tata', 'ICICI Bank', 'HDFC Bank', 'State Bank of India',
  'Government of India', 'State Government', 'Self Employed', 'Not Applicable'
];

const salaryRanges = [
  '50-75 Lakh', '75-100 Lakh', '100-125 Lakh', '125-150 Lakh',
  '150-175 Lakh', '175-200 Lakh', '200 Lakh+'
];

const complexions = ['very-fair', 'fair', 'wheatish', 'dark'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const diets = ['vegetarian', 'non-vegetarian', 'vegan', 'jain'];
const gotras = ['Bharadwaj', 'Vashishtha', 'Kashyap', 'Atri', 'Gautam', 'Jamadagni', 'Vishwamitra', 'Agastya'];
const motherTongues = ['Hindi', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Punjabi', 'English'];
const rashis = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const nakshatras = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta',
  'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];
const manglikStatuses = ['manglik', 'angshik', 'non-manglik'];
const familyTypes = ['joint', 'nuclear'];
const familyStatuses = ['middle-class', 'upper-middle-class', 'upper-class', 'lower-middle-class'];
const familyValues = ['traditional', 'moderate', 'liberal'];
const occupationTypes = ['job', 'private', 'govt', 'business'];
const hobbies = [
  ['Reading', 'Traveling', 'Music', 'Cooking'],
  ['Dancing', 'Photography', 'Sports', 'Gaming'],
  ['Movies', 'Yoga', 'Meditation', 'Art'],
  ['Singing', 'Writing', 'Gardening', 'Fitness']
];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomAge(gender) {
  if (gender === 'male') {
    return Math.floor(Math.random() * 16) + 25; // 25-40
  } else {
    return Math.floor(Math.random() * 14) + 22; // 22-35
  }
}

function generatePhoneNumber(index) {
  return String(9000000000 + index);
}

function generateGahoiId(gender, index) {
  const baseId = 10000;
  if (gender === 'male') {
    return baseId + (index * 2); // Even: 10000, 10002, ...
  } else {
    return baseId + (index * 2) + 1; // Odd: 10001, 10003, ...
  }
}

function generateDateOfBirth(age) {
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - age;
  const month = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1;
  return new Date(birthYear, month, day);
}

function generateTimeOfBirth() {
  const hour = Math.floor(Math.random() * 24);
  const minute = Math.floor(Math.random() * 60);
  const second = Math.floor(Math.random() * 60);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
}

function generateHeightInches(gender) {
  if (gender === 'male') {
    return Math.floor(Math.random() * 8) + 66; // 66-73 inches (5'6" to 6'1")
  } else {
    return Math.floor(Math.random() * 6) + 60; // 60-65 inches (5'0" to 5'5")
  }
}

async function resetAndCreateProfiles() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/matrimonial';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Step 1: Delete ALL existing users
    console.log('🗑️  Deleting all existing users...');
    const deleteResult = await User.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} existing users\n`);

    // Step 2: Create 50 new profiles with complete details
    const usersToCreate = [];
    let phoneIndex = 200;
    let maleIndex = 0;
    let femaleIndex = 0;

    // Create 25 male users
    for (let i = 0; i < 25; i++) {
      const name = getRandomElement(maleNames);
      const phone = generatePhoneNumber(phoneIndex++);
      const age = getRandomAge('male');
      const dateOfBirth = generateDateOfBirth(age);
      const state = getRandomElement(states);
      const city = getRandomElement(cities);
      const town = getRandomElement(towns);
      const pincode = getRandomElement(pincodes);
      const gahoiId = generateGahoiId('male', maleIndex++);
      const occupation = getRandomElement(occupations);
      const profession = getRandomElement(professions);
      const education = getRandomElement(educations);
      const rashi = getRandomElement(rashis);
      const nakshatra = getRandomElement(nakshatras);
      const timeOfBirth = generateTimeOfBirth();
      
      // Family details
      const numBrothers = Math.floor(Math.random() * 3); // 0-2
      const numSisters = Math.floor(Math.random() * 3); // 0-2
      const marriedBrothers = Math.floor(Math.random() * (numBrothers + 1));
      const unmarriedBrothers = numBrothers - marriedBrothers;
      const marriedSisters = Math.floor(Math.random() * (numSisters + 1));
      const unmarriedSisters = numSisters - marriedSisters;

      usersToCreate.push({
        name,
        phone,
        whatsappNumber: phone,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}${phoneIndex}@example.com`,
        gender: 'male',
        age,
        dateOfBirth,
        gahoiId,
        maritalStatus: 'unmarried',
        
        // Physical Attributes
        height: generateHeightInches('male'),
        weight: Math.floor(Math.random() * 20) + 65, // 65-85 kg
        complexion: getRandomElement(complexions),
        bloodGroup: getRandomElement(bloodGroups),
        disability: Math.random() < 0.05 ? 'yes' : 'no', // 5% with disability
        profileCreatedBy: getRandomElement(['self', 'family', 'relative']),
        
        // Location
        country: 'India',
        state,
        city,
        town,
        pincode,
        presentAddress: `${Math.floor(Math.random() * 100) + 1}, ${town}, ${city}, ${state} - ${pincode}`,
        permanentAddress: `${Math.floor(Math.random() * 100) + 1}, ${town}, ${city}, ${state} - ${pincode}`,
        
        // Family & Background
        gotra: getRandomElement(gotras),
        motherTongue: getRandomElement(motherTongues),
        
        // Horoscope Details
        horoscopeDetails: {
          starSign: rashi,
          rashi,
          nakshatra,
          aakna: getRandomElement(gotras),
          manglikStatus: getRandomElement(manglikStatuses),
          timeOfBirth,
          placeOfBirth: `${city}, ${state}, India`
        },
        
        // Education & Career
        education,
        educationalDetail: getRandomElement(educationalDetails),
        fieldOfStudy: getRandomElement(fieldsOfStudy),
        occupation,
        profession,
        employer: occupation === 'Home Maker / House Wife' ? 'Not Applicable' : getRandomElement(employers),
        occupationDetail: `${occupation} with ${Math.floor(Math.random() * 10) + 1} years of experience`,
        annualIncome: occupation === 'Home Maker / House Wife' ? 'Not Applicable' : getRandomElement(salaryRanges),
        
        // Family Information
        family: {
          fathersName: `Shri ${name.split(' ')[0]} ${name.split(' ')[1]} Senior`,
          fathersOccupationType: getRandomElement(occupationTypes),
          fathersOccupationDesc: getRandomElement(occupations),
          fathersContactNumber: generatePhoneNumber(phoneIndex++),
          mothersName: `Smt. ${getRandomElement(femaleNames)}`,
          mothersOccupationType: Math.random() < 0.3 ? 'job' : null,
          mothersOccupationDesc: Math.random() < 0.3 ? getRandomElement(occupations) : 'Home Maker',
          numberOfBrothers: numBrothers,
          numberOfSisters: numSisters,
          marriedBrothers,
          unmarriedBrothers,
          marriedSisters,
          unmarriedSisters,
          maternalUncleName: `Shri ${getRandomElement(maleNames)}`,
          maternalUncleAakna: getRandomElement(gotras),
          familyType: getRandomElement(familyTypes),
          familyStatus: getRandomElement(familyStatuses),
          familyValues: getRandomElement(familyValues)
        },
        
        // Lifestyle
        diet: getRandomElement(diets),
        dietaryHabit: getRandomElement(diets),
        smoking: Math.random() < 0.1, // 10% smokers
        drinking: Math.random() < 0.15, // 15% drinkers
        hobbies: getRandomElement(hobbies),
        partnerPreference: `Looking for a well-educated, family-oriented partner who values relationships and shares similar cultural values. Prefer someone from ${state} or nearby states.`,
        
        // Property & Assets
        hasHouse: getRandomElement(['yes-personal', 'yes-rented', 'no']),
        hasCar: Math.random() < 0.6, // 60% have car
        
        // Profile Content
        bio: `Hello! I am ${name}, a ${age}-year-old ${occupation} from ${city}, ${state}. I come from a ${getRandomElement(familyStatuses)} ${getRandomElement(familyTypes)} family. I am looking for a compatible life partner who shares similar values and interests. I enjoy ${getRandomElement(hobbies).join(', ')}.`,
        
        // Preferences
        preferences: {
          minAge: age - 3,
          maxAge: age + 5,
          gender: 'female',
          minHeight: 58, // 4'10"
          maxHeight: 66, // 5'6"
          location: state,
          education: education,
          occupation: 'any',
          maritalStatus: 'unmarried'
        },
        
        // Profile Status
        isProfileComplete: true,
        isActive: true
      });
    }

    // Create 25 female users
    for (let i = 0; i < 25; i++) {
      const name = getRandomElement(femaleNames);
      const phone = generatePhoneNumber(phoneIndex++);
      const age = getRandomAge('female');
      const dateOfBirth = generateDateOfBirth(age);
      const state = getRandomElement(states);
      const city = getRandomElement(cities);
      const town = getRandomElement(towns);
      const pincode = getRandomElement(pincodes);
      const gahoiId = generateGahoiId('female', femaleIndex++);
      const occupation = getRandomElement(occupations);
      const profession = getRandomElement(professions);
      const education = getRandomElement(educations);
      const rashi = getRandomElement(rashis);
      const nakshatra = getRandomElement(nakshatras);
      const timeOfBirth = generateTimeOfBirth();
      
      // Family details
      const numBrothers = Math.floor(Math.random() * 3); // 0-2
      const numSisters = Math.floor(Math.random() * 3); // 0-2
      const marriedBrothers = Math.floor(Math.random() * (numBrothers + 1));
      const unmarriedBrothers = numBrothers - marriedBrothers;
      const marriedSisters = Math.floor(Math.random() * (numSisters + 1));
      const unmarriedSisters = numSisters - marriedSisters;

      usersToCreate.push({
        name,
        phone,
        whatsappNumber: phone,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}${phoneIndex}@example.com`,
        gender: 'female',
        age,
        dateOfBirth,
        gahoiId,
        maritalStatus: 'unmarried',
        
        // Physical Attributes
        height: generateHeightInches('female'),
        weight: Math.floor(Math.random() * 15) + 50, // 50-65 kg
        complexion: getRandomElement(complexions),
        bloodGroup: getRandomElement(bloodGroups),
        disability: Math.random() < 0.05 ? 'yes' : 'no', // 5% with disability
        profileCreatedBy: getRandomElement(['self', 'family', 'relative']),
        
        // Location
        country: 'India',
        state,
        city,
        town,
        pincode,
        presentAddress: `${Math.floor(Math.random() * 100) + 1}, ${town}, ${city}, ${state} - ${pincode}`,
        permanentAddress: `${Math.floor(Math.random() * 100) + 1}, ${town}, ${city}, ${state} - ${pincode}`,
        
        // Family & Background
        gotra: getRandomElement(gotras),
        motherTongue: getRandomElement(motherTongues),
        
        // Horoscope Details
        horoscopeDetails: {
          starSign: rashi,
          rashi,
          nakshatra,
          aakna: getRandomElement(gotras),
          manglikStatus: getRandomElement(manglikStatuses),
          timeOfBirth,
          placeOfBirth: `${city}, ${state}, India`
        },
        
        // Education & Career
        education,
        educationalDetail: getRandomElement(educationalDetails),
        fieldOfStudy: getRandomElement(fieldsOfStudy),
        occupation,
        profession,
        employer: occupation === 'Home Maker / House Wife' ? 'Not Applicable' : getRandomElement(employers),
        occupationDetail: occupation === 'Home Maker / House Wife' ? 'Taking care of home and family' : `${occupation} with ${Math.floor(Math.random() * 10) + 1} years of experience`,
        annualIncome: occupation === 'Home Maker / House Wife' ? 'Not Applicable' : getRandomElement(salaryRanges),
        
        // Family Information
        family: {
          fathersName: `Shri ${name.split(' ')[0]} ${name.split(' ')[1]} Senior`,
          fathersOccupationType: getRandomElement(occupationTypes),
          fathersOccupationDesc: getRandomElement(occupations),
          fathersContactNumber: generatePhoneNumber(phoneIndex++),
          mothersName: `Smt. ${getRandomElement(femaleNames)}`,
          mothersOccupationType: Math.random() < 0.3 ? 'job' : null,
          mothersOccupationDesc: Math.random() < 0.3 ? getRandomElement(occupations) : 'Home Maker',
          numberOfBrothers: numBrothers,
          numberOfSisters: numSisters,
          marriedBrothers,
          unmarriedBrothers,
          marriedSisters,
          unmarriedSisters,
          maternalUncleName: `Shri ${getRandomElement(maleNames)}`,
          maternalUncleAakna: getRandomElement(gotras),
          familyType: getRandomElement(familyTypes),
          familyStatus: getRandomElement(familyStatuses),
          familyValues: getRandomElement(familyValues)
        },
        
        // Lifestyle
        diet: getRandomElement(diets),
        dietaryHabit: getRandomElement(diets),
        smoking: Math.random() < 0.05, // 5% smokers
        drinking: Math.random() < 0.08, // 8% drinkers
        hobbies: getRandomElement(hobbies),
        partnerPreference: `Seeking a well-settled, educated, and family-oriented partner who respects relationships and values. Prefer someone from ${state} or nearby states with good family background.`,
        
        // Property & Assets
        hasHouse: getRandomElement(['yes-personal', 'yes-rented', 'no']),
        hasCar: Math.random() < 0.5, // 50% have car
        
        // Profile Content
        bio: `Namaste! I am ${name}, ${age} years old, working as a ${occupation} in ${city}, ${state}. I come from a ${getRandomElement(familyStatuses)} ${getRandomElement(familyTypes)} family. I am seeking a life partner for a happy and harmonious marriage based on mutual respect and understanding. I enjoy ${getRandomElement(hobbies).join(', ')}.`,
        
        // Preferences
        preferences: {
          minAge: age + 2,
          maxAge: age + 8,
          gender: 'male',
          minHeight: 66, // 5'6"
          maxHeight: 74, // 6'2"
          location: state,
          education: education,
          occupation: 'any',
          maritalStatus: 'unmarried'
        },
        
        // Profile Status
        isProfileComplete: true,
        isActive: true
      });
    }

    console.log(`📝 Creating ${usersToCreate.length} complete profiles...\n`);

    const results = {
      created: [],
      errors: []
    };

    // Create users one by one
    for (const userData of usersToCreate) {
      try {
        const user = new User(userData);
        await user.save();
        results.created.push({
          name: user.name,
          phone: user.phone,
          gahoiId: user.gahoiId,
          gender: user.gender,
          id: user._id
        });
        console.log(`✅ Created: ${user.name} (Gahoi ID: ${user.gahoiId}, ${user.gender})`);
      } catch (error) {
        results.errors.push({
          name: userData.name,
          gahoiId: userData.gahoiId,
          error: error.message
        });
        console.log(`❌ Error creating ${userData.name} (Gahoi ID: ${userData.gahoiId}): ${error.message}`);
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

    console.log('\n✨ Profile creation completed!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
resetAndCreateProfiles();

