/**
 * Astrology Calculation Service
 * Calculates Indian Vedic Astrology details (Rashi, Nakshatra) from Date of Birth, Time, and Place
 * Uses Prokerala API (free tier) or fallback calculation
 */

import axios from 'axios';

// Prokerala API endpoint (free tier)
const PROKERALA_API_URL = 'https://api.prokerala.com/v2/astrology/birth-details';

// Fallback: Basic calculation using simplified algorithms
// Note: This is a simplified version. For accurate calculations, use Prokerala API or similar services

/**
 * Get coordinates from place name using geocoding
 * For now, we'll use a simplified approach with major Indian cities
 */
const CITY_COORDINATES = {
  'Mumbai': { lat: 19.0760, lon: 72.8777 },
  'Delhi': { lat: 28.6139, lon: 77.2090 },
  'Bangalore': { lat: 12.9716, lon: 77.5946 },
  'Hyderabad': { lat: 17.3850, lon: 78.4867 },
  'Chennai': { lat: 13.0827, lon: 80.2707 },
  'Kolkata': { lat: 22.5726, lon: 88.3639 },
  'Pune': { lat: 18.5204, lon: 73.8567 },
  'Ahmedabad': { lat: 23.0225, lon: 72.5714 },
  'Jaipur': { lat: 26.9124, lon: 75.7873 },
  'Lucknow': { lat: 26.8467, lon: 80.9462 },
  'Kanpur': { lat: 26.4499, lon: 80.3319 },
  'Nagpur': { lat: 21.1458, lon: 79.0882 },
  'Indore': { lat: 22.7196, lon: 75.8577 },
  'Thane': { lat: 19.2183, lon: 72.9781 },
  'Bhopal': { lat: 23.2599, lon: 77.4126 },
  'Visakhapatnam': { lat: 17.6868, lon: 83.2185 },
  'Patna': { lat: 25.5941, lon: 85.1376 },
  'Vadodara': { lat: 22.3072, lon: 73.1812 },
  'Ghaziabad': { lat: 28.6692, lon: 77.4538 },
  'Ludhiana': { lat: 30.9010, lon: 75.8573 },
};

/**
 * Get coordinates from place name
 */
function getCoordinates(placeName) {
  if (!placeName) return null;
  
  // Try exact match first
  const normalizedPlace = placeName.trim();
  if (CITY_COORDINATES[normalizedPlace]) {
    return CITY_COORDINATES[normalizedPlace];
  }
  
  // Try case-insensitive match
  for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
    if (city.toLowerCase() === normalizedPlace.toLowerCase()) {
      return coords;
    }
  }
  
  // Default to Delhi if not found
  return { lat: 28.6139, lon: 77.2090 };
}

/**
 * Calculate Rashi (Moon Sign) from date and time
 * Simplified calculation - for accurate results, use Prokerala API
 */
function calculateRashi(dateOfBirth, timeOfBirth) {
  if (!dateOfBirth) return null;
  
  const date = new Date(dateOfBirth);
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();
  
  // Simplified Rashi calculation based on month and day
  // This is approximate - real calculation requires precise moon position
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces';
  
  return null;
}

/**
 * Calculate Nakshatra from date
 * Simplified calculation - for accurate results, use Prokerala API
 */
function calculateNakshatra(dateOfBirth) {
  if (!dateOfBirth) return null;
  
  const date = new Date(dateOfBirth);
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  
  // Simplified: Map day of year to nakshatra (27 nakshatras)
  const nakshatras = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
  ];
  
  const index = dayOfYear % 27;
  return nakshatras[index];
}

/**
 * Calculate Manglik status from Rashi
 */
function calculateManglikStatus(rashi) {
  if (!rashi) return null;
  
  // Manglik signs: Aries, Leo, Scorpio, Capricorn
  const manglikRashis = ['Aries', 'Leo', 'Scorpio', 'Capricorn'];
  
  if (manglikRashis.includes(rashi)) {
    return 'manglik';
  }
  
  return 'non-manglik';
}

/**
 * Calculate horoscope using Prokerala API (free tier)
 */
async function calculateUsingProkeralaAPI(dateOfBirth, timeOfBirth, placeOfBirth) {
  try {
    const coords = getCoordinates(placeOfBirth);
    if (!coords) {
      throw new Error('Place coordinates not found');
    }
    
    const date = new Date(dateOfBirth);
    const [hours, minutes = 0, seconds = 0] = (timeOfBirth || '12:00:00').split(':').map(Number);
    
    // Format date for API: YYYY-MM-DD
    const pad = (num) => String(num).length === 1 ? '0' + num : String(num);
    const dateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    const timeStr = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    
    // Prokerala API credentials (hardcoded)
    const clientId = '67228c93-40bd-403d-ae13-f6837c6544ef';
    const clientSecret = 'Sru0x9rJz2ERxDkzK66URb49RmavHjokJ35ZUSuV';
    
    // Prokerala API uses OAuth2 - get access token first
    try {
      // Step 1: Get OAuth2 access token
      const tokenParams = new URLSearchParams();
      tokenParams.append('grant_type', 'client_credentials');
      tokenParams.append('client_id', clientId);
      tokenParams.append('client_secret', clientSecret);
      
      const tokenResponse = await axios.post('https://api.prokerala.com/token', 
        tokenParams.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000,
        }
      );
      
      const accessToken = tokenResponse.data?.access_token;
      if (!accessToken) {
        console.error('Failed to get Prokerala access token');
        return null;
      }
      
      // Step 2: Call birth details API with access token
      const response = await axios.post('https://api.prokerala.com/v2/astrology/birth-details', {
        datetime: `${dateStr}T${timeStr}`,
        latitude: coords.lat,
        longitude: coords.lon,
        ayanamsa: 1, // Lahiri
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
    
      if (response.data && response.data.data) {
        const data = response.data.data;
        return {
          rashi: data.moon?.sign || null,
          nakshatra: data.moon?.nakshatra?.name || null,
          manglikStatus: calculateManglikStatus(data.moon?.sign),
        };
      }
      
      return null;
    } catch (error) {
      console.error('Prokerala API error:', error.response?.data || error.message);
      return null;
    }
}

/**
 * Main function to calculate horoscope from DOB, time, and place
 */
export const astrologyCalculationService = {
  async calculateHoroscope(dateOfBirth, timeOfBirth, placeOfBirth) {
    if (!dateOfBirth) {
      return {
        success: false,
        message: 'Date of birth is required',
      };
    }
    
    // Try Prokerala API first (if API key is available)
    const apiResult = await calculateUsingProkeralaAPI(dateOfBirth, timeOfBirth, placeOfBirth);
    if (apiResult) {
      return {
        success: true,
        data: {
          rashi: apiResult.rashi,
          nakshatra: apiResult.nakshatra,
          manglikStatus: apiResult.manglikStatus,
          source: 'prokerala_api',
        },
      };
    }
    
    // Fallback to simplified calculation
    const rashi = calculateRashi(dateOfBirth, timeOfBirth);
    const nakshatra = calculateNakshatra(dateOfBirth);
    const manglikStatus = calculateManglikStatus(rashi);
    
    if (!rashi || !nakshatra) {
      return {
        success: false,
        message: 'Unable to calculate horoscope. Please provide date of birth, time, and place.',
      };
    }
    
    return {
      success: true,
      data: {
        rashi,
        nakshatra,
        manglikStatus,
        source: 'fallback_calculation',
        note: 'For more accurate calculations, please use Prokerala API or consult an astrologer',
      },
    };
  },
};

