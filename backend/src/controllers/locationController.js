import axios from 'axios';

/**
 * Location Controller - Provides country, state, district, and city data
 * Uses free public APIs
 */

// Cache for countries (rarely changes)
let countriesCache = null;
let countriesCacheTime = null;

// Countries Now API - Free, no API key required
const COUNTRIES_API = 'https://countriesnow.space/api/v0.1/countries';

/**
 * Get all countries
 * GET /api/locations/countries
 */
export const getCountries = async (req, res, next) => {
  try {
    // Return cached data if available and less than 24 hours old
    if (countriesCache && countriesCacheTime && (Date.now() - countriesCacheTime < 24 * 60 * 60 * 1000)) {
      return res.json({
        status: true,
        message: 'Countries retrieved successfully',
        data: countriesCache
      });
    }

    // Fetch from API
    const response = await axios.get(`${COUNTRIES_API}`);
    
    if (response.data?.data) {
      const countries = response.data.data.map(country => ({
        name: country.country,
        iso2: country.iso2,
        iso3: country.iso3,
      })).sort((a, b) => a.name.localeCompare(b.name));

      // Cache the data
      countriesCache = countries;
      countriesCacheTime = Date.now();

      res.json({
        status: true,
        message: 'Countries retrieved successfully',
        data: countries
      });
    } else {
      throw new Error('Failed to fetch countries');
    }
  } catch (error) {
    console.error('Error fetching countries:', error);
    // Return fallback data if API fails
    const fallbackCountries = [
      { name: 'India', iso2: 'IN', iso3: 'IND' },
      { name: 'United States', iso2: 'US', iso3: 'USA' },
      { name: 'United Kingdom', iso2: 'GB', iso3: 'GBR' },
      { name: 'Canada', iso2: 'CA', iso3: 'CAN' },
      { name: 'Australia', iso2: 'AU', iso3: 'AUS' },
    ];

    res.json({
      status: true,
      message: 'Countries retrieved successfully (fallback)',
      data: fallbackCountries
    });
  }
};

/**
 * Get states for a country
 * GET /api/locations/states?country=India
 */
export const getStates = async (req, res, next) => {
  try {
    const { country } = req.query;

    if (!country) {
      return res.status(400).json({
        status: false,
        message: 'Country name is required'
      });
    }

    // Fetch states for the country - Countries Now API requires POST
    const response = await axios.post(`${COUNTRIES_API}/states`, {
      country: country
    });

    if (response.data?.data?.states) {
      const states = response.data.data.states
        .map(state => ({ name: state.name || state }))
        .sort((a, b) => a.name.localeCompare(b.name));

      res.json({
        status: true,
        message: 'States retrieved successfully',
        data: states
      });
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      // Handle case where API returns states directly as array
      const states = response.data.data
        .map(state => ({ name: state.name || state }))
        .sort((a, b) => a.name.localeCompare(b.name));

      res.json({
        status: true,
        message: 'States retrieved successfully',
        data: states
      });
    } else {
      // Return empty array if no states found
      res.json({
        status: true,
        message: 'No states found',
        data: []
      });
    }
  } catch (error) {
    console.error('Error fetching states:', error);
    
    // Return fallback states for India
    const fallbackStates = country?.toLowerCase().includes('india') ? [
      { name: 'Andhra Pradesh' },
      { name: 'Arunachal Pradesh' },
      { name: 'Assam' },
      { name: 'Bihar' },
      { name: 'Chhattisgarh' },
      { name: 'Delhi' },
      { name: 'Goa' },
      { name: 'Gujarat' },
      { name: 'Haryana' },
      { name: 'Himachal Pradesh' },
      { name: 'Jharkhand' },
      { name: 'Karnataka' },
      { name: 'Kerala' },
      { name: 'Madhya Pradesh' },
      { name: 'Maharashtra' },
      { name: 'Manipur' },
      { name: 'Meghalaya' },
      { name: 'Mizoram' },
      { name: 'Nagaland' },
      { name: 'Odisha' },
      { name: 'Punjab' },
      { name: 'Rajasthan' },
      { name: 'Sikkim' },
      { name: 'Tamil Nadu' },
      { name: 'Telangana' },
      { name: 'Tripura' },
      { name: 'Uttar Pradesh' },
      { name: 'Uttarakhand' },
      { name: 'West Bengal' },
    ] : [];

    res.json({
      status: true,
      message: 'States retrieved successfully (fallback)',
      data: fallbackStates
    });
  }
};

/**
 * Get districts for a state (India-specific)
 * GET /api/locations/districts?state=Maharashtra&country=India
 */
export const getDistricts = async (req, res, next) => {
  try {
    const { state, country } = req.query;

    if (!state || !country) {
      return res.status(400).json({
        status: false,
        message: 'State and country are required'
      });
    }

    // For India, use a free districts API or static data
    if (country.toLowerCase().includes('india')) {
      try {
        // Try using an Indian districts API or static data
        // Using static data for now - can be replaced with API
        const districtsData = getIndiaDistricts(state);
        
        if (districtsData.length > 0) {
          return res.json({
            status: true,
            message: 'Districts retrieved successfully',
            data: districtsData.map(district => ({ name: district })).sort()
          });
        }
      } catch (error) {
        console.error('Error fetching districts:', error);
      }
    }

    // Fallback: Return empty array or try alternative API
    res.json({
      status: true,
      message: 'Districts retrieved successfully',
      data: []
    });
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.json({
      status: true,
      message: 'Districts retrieved successfully',
      data: []
    });
  }
};

/**
 * Get cities for a country/state
 * GET /api/locations/cities?country=India&state=Maharashtra
 */
export const getCities = async (req, res, next) => {
  try {
    const { country, state } = req.query;

    if (!country) {
      return res.status(400).json({
        status: false,
        message: 'Country name is required'
      });
    }

    // If state is provided and country is India, use state-specific cities
    if (state && country.toLowerCase().includes('india')) {
      const stateCities = getIndiaDistricts(state);
      if (stateCities.length > 0) {
        return res.json({
          status: true,
          message: 'Cities retrieved successfully',
          data: stateCities.map(city => ({ name: city })).sort()
        });
      }
    }

    // Fetch cities for the country from API
    try {
      const response = await axios.post(`${COUNTRIES_API}/cities`, {
        country: country
      }, {
        timeout: 10000 // 10 second timeout
      });

      if (response.data?.data) {
        let cities = response.data.data
          .map(city => ({ name: city }))
          .sort((a, b) => a.name.localeCompare(b.name));

        res.json({
          status: true,
          message: 'Cities retrieved successfully',
          data: cities
        });
        return;
      }
    } catch (apiError) {
      console.error('Error fetching cities from API:', apiError.message);
      // Fall through to fallback
    }
    
    // Return fallback cities for India (most common use case)
    const fallbackCities = country?.toLowerCase().includes('india') ? [
      { name: 'Mumbai' },
      { name: 'Delhi' },
      { name: 'Bangalore' },
      { name: 'Hyderabad' },
      { name: 'Chennai' },
      { name: 'Kolkata' },
      { name: 'Pune' },
      { name: 'Ahmedabad' },
      { name: 'Jaipur' },
      { name: 'Surat' },
    ] : [];

    res.json({
      status: true,
      message: 'Cities retrieved successfully (fallback)',
      data: fallbackCities
    });
  } catch (error) {
    console.error('Error in getCities:', error);
    
    // Return fallback cities for India
    const fallbackCities = country?.toLowerCase().includes('india') ? [
      { name: 'Mumbai' },
      { name: 'Delhi' },
      { name: 'Bangalore' },
      { name: 'Hyderabad' },
      { name: 'Chennai' },
      { name: 'Kolkata' },
      { name: 'Pune' },
      { name: 'Ahmedabad' },
      { name: 'Jaipur' },
      { name: 'Surat' },
    ] : [];

    res.json({
      status: true,
      message: 'Cities retrieved successfully (fallback)',
      data: fallbackCities
    });
  }
};

/**
 * Helper function: Get districts for Indian states
 * This uses static data - can be replaced with an API call
 */
function getIndiaDistricts(stateName) {
  const districtsMap = {
    'maharashtra': [
      'Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 
      'Amravati', 'Kolhapur', 'Sangli', 'Jalgaon', 'Akola', 'Latur', 'Ahmednagar', 'Chandrapur'
    ],
    'karnataka': [
      'Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga', 'Davangere', 
      'Bijapur', 'Bellary', 'Tumkur', 'Shimoga', 'Raichur', 'Udupi', 'Dharwad', 'Hassan'
    ],
    'gujarat': [
      'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar',
      'Junagadh', 'Anand', 'Bharuch', 'Mehsana', 'Navsari', 'Porbandar', 'Surendranagar'
    ],
    'tamil nadu': [
      'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli',
      'Erode', 'Vellore', 'Dindigul', 'Thanjavur', 'Tuticorin', 'Kanchipuram', 'Tiruppur'
    ],
    'delhi': [
      'Central Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi',
      'New Delhi', 'North East Delhi', 'North West Delhi', 'South West Delhi', 'Shahdara'
    ],
    'uttar pradesh': [
      'Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Allahabad', 'Meerut', 'Ghaziabad',
      'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Faizabad', 'Mathura'
    ],
    'rajasthan': [
      'Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara',
      'Alwar', 'Bharatpur', 'Sri Ganganagar', 'Sikar', 'Pali', 'Hanumangarh', 'Tonk'
    ],
    'west bengal': [
      'Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Malda',
      'Hooghly', 'Nadia', 'Murshidabad', 'Cooch Behar', 'Jalpaiguri', 'Bankura', 'Purulia'
    ],
    'madhya pradesh': [
      'Indore', 'Bhopal', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Ratlam',
      'Dewas', 'Satna', 'Rewa', 'Katni', 'Chhindwara', 'Vidisha', 'Morena'
    ],
    'andhra pradesh': [
      'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Rajahmundry', 'Kurnool',
      'Kadapa', 'Anantapur', 'Eluru', 'Tirupati', 'Ongole', 'Chittoor', 'Machilipatnam'
    ],
    'bihar': [
      'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Arrah',
      'Bihar Sharif', 'Katihar', 'Munger', 'Chapra', 'Saharsa', 'Sitamarhi', 'Hajipur'
    ],
    'punjab': [
      'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Hoshiarpur', 'Moga',
      'Pathankot', 'Sangrur', 'Batala', 'Mohali', 'Firozpur', 'Phagwara', 'Kapurthala'
    ],
    'haryana': [
      'Gurgaon', 'Faridabad', 'Panipat', 'Ambala', 'Karnal', 'Hisar', 'Rohtak',
      'Panchkula', 'Yamunanagar', 'Kurukshetra', 'Sonipat', 'Bhiwani', 'Rewari', 'Jind'
    ],
    'kerala': [
      'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Palakkad', 'Kannur',
      'Kollam', 'Alappuzha', 'Kottayam', 'Malappuram', 'Pathanamthitta', 'Idukki', 'Wayanad'
    ],
  };

  const normalizedState = stateName.toLowerCase().trim();
  return districtsMap[normalizedState] || [];
}
