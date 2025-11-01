/**
 * Horoscope Matching Service
 * Calculates 36 Gunas matching score between two profiles
 * Based on traditional Indian astrology matching system
 */

// Rashi (Moon Sign) Compatibility Matrix
const rashiCompatibility = {
  'Aries': { compatible: ['Leo', 'Sagittarius', 'Gemini', 'Aquarius'], neutral: ['Libra', 'Aries'], incompatible: ['Cancer', 'Capricorn'] },
  'Taurus': { compatible: ['Virgo', 'Capricorn', 'Cancer', 'Pisces'], neutral: ['Scorpio', 'Taurus'], incompatible: ['Leo', 'Aquarius'] },
  'Gemini': { compatible: ['Libra', 'Aquarius', 'Aries', 'Leo'], neutral: ['Sagittarius', 'Gemini'], incompatible: ['Virgo', 'Pisces'] },
  'Cancer': { compatible: ['Scorpio', 'Pisces', 'Taurus', 'Virgo'], neutral: ['Capricorn', 'Cancer'], incompatible: ['Aries', 'Libra'] },
  'Leo': { compatible: ['Sagittarius', 'Aries', 'Gemini', 'Libra'], neutral: ['Aquarius', 'Leo'], incompatible: ['Taurus', 'Scorpio'] },
  'Virgo': { compatible: ['Capricorn', 'Taurus', 'Cancer', 'Scorpio'], neutral: ['Pisces', 'Virgo'], incompatible: ['Gemini', 'Sagittarius'] },
  'Libra': { compatible: ['Aquarius', 'Gemini', 'Leo', 'Sagittarius'], neutral: ['Aries', 'Libra'], incompatible: ['Cancer', 'Capricorn'] },
  'Scorpio': { compatible: ['Pisces', 'Cancer', 'Virgo', 'Capricorn'], neutral: ['Taurus', 'Scorpio'], incompatible: ['Leo', 'Aquarius'] },
  'Sagittarius': { compatible: ['Aries', 'Leo', 'Libra', 'Aquarius'], neutral: ['Gemini', 'Sagittarius'], incompatible: ['Virgo', 'Pisces'] },
  'Capricorn': { compatible: ['Taurus', 'Virgo', 'Scorpio', 'Pisces'], neutral: ['Cancer', 'Capricorn'], incompatible: ['Aries', 'Libra'] },
  'Aquarius': { compatible: ['Gemini', 'Libra', 'Sagittarius', 'Aries'], neutral: ['Leo', 'Aquarius'], incompatible: ['Taurus', 'Scorpio'] },
  'Pisces': { compatible: ['Cancer', 'Scorpio', 'Capricorn', 'Taurus'], neutral: ['Virgo', 'Pisces'], incompatible: ['Gemini', 'Sagittarius'] },
};

// Nakshatra Compatibility (simplified)
const nakshatraCompatibility = {
  // Friendly groups
  friendly: [
    ['Ashwini', 'Magha', 'Mula'],
    ['Bharani', 'Purva Phalguni', 'Purva Ashadha'],
    ['Krittika', 'Uttara Phalguni', 'Uttara Ashadha'],
    ['Rohini', 'Hasta', 'Shravana'],
    ['Mrigashira', 'Chitra', 'Dhanishta'],
    ['Ardra', 'Swati', 'Shatabhisha'],
    ['Punarvasu', 'Vishakha', 'Purva Bhadrapada'],
    ['Pushya', 'Anuradha', 'Uttara Bhadrapada'],
    ['Ashlesha', 'Jyeshtha', 'Revati'],
  ],
};

// Varna Matching (4 points)
function getVarnaMatch(rashi1, rashi2) {
  if (!rashi1 || !rashi2) return { score: 0, max: 4, matched: false, detail: 'Rashi information not available' };
  
  const varna = {
    'Aries': 1, 'Taurus': 2, 'Gemini': 1, 'Cancer': 2,
    'Leo': 1, 'Virgo': 2, 'Libra': 1, 'Scorpio': 2,
    'Sagittarius': 1, 'Capricorn': 2, 'Aquarius': 1, 'Pisces': 2,
  };
  
  const diff = Math.abs((varna[rashi1] || 0) - (varna[rashi2] || 0));
  if (diff === 0) return { score: 4, max: 4, matched: true, detail: 'Same Varna - Perfect match' };
  if (diff === 1) return { score: 2, max: 4, matched: true, detail: 'Adjacent Varna - Good match' };
  return { score: 0, max: 4, matched: false, detail: 'Different Varna - Basic compatibility' };
}

// Vasya Matching (2 points)
function getVasyaMatch(rashi1, rashi2) {
  if (!rashi1 || !rashi2) return { score: 0, max: 2, matched: false, detail: 'Rashi information not available' };
  
  // Opposite signs have better Vasya
  const opposites = {
    'Aries': 'Libra', 'Taurus': 'Scorpio', 'Gemini': 'Sagittarius', 'Cancer': 'Capricorn',
    'Leo': 'Aquarius', 'Virgo': 'Pisces', 'Libra': 'Aries', 'Scorpio': 'Taurus',
    'Sagittarius': 'Gemini', 'Capricorn': 'Cancer', 'Aquarius': 'Leo', 'Pisces': 'Virgo',
  };
  
  if (opposites[rashi1] === rashi2 || opposites[rashi2] === rashi1) {
    return { score: 2, max: 2, matched: true, detail: 'Opposite signs - Perfect attraction' };
  }
  
  if (rashiCompatibility[rashi1]?.compatible?.includes(rashi2)) {
    return { score: 1, max: 2, matched: true, detail: 'Compatible signs - Good attraction' };
  }
  
  return { score: 0, max: 2, matched: false, detail: 'Basic compatibility' };
}

// Tara Matching (3 points) - Based on nakshatra
function getTaraMatch(nakshatra1, nakshatra2) {
  if (!nakshatra1 || !nakshatra2) return { score: 0, max: 3, matched: false, detail: 'Nakshatra information not available' };
  
  // Check if nakshatras are in same friendly group
  for (const group of nakshatraCompatibility.friendly) {
    if (group.includes(nakshatra1) && group.includes(nakshatra2)) {
      return { score: 3, max: 3, matched: true, detail: 'Same friendly group - Perfect match' };
    }
  }
  
  // Calculate distance (simplified)
  const allNakshatras = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
  ];
  
  const index1 = allNakshatras.indexOf(nakshatra1);
  const index2 = allNakshatras.indexOf(nakshatra2);
  
  if (index1 === -1 || index2 === -1) {
    return { score: 1, max: 3, matched: true, detail: 'Nakshatra compatibility - Average' };
  }
  
  const distance = Math.abs(index1 - index2);
  if (distance === 0 || distance === 27) return { score: 3, max: 3, matched: true, detail: 'Same/Adjacent Nakshatra - Perfect' };
  if (distance <= 6) return { score: 2, max: 3, matched: true, detail: 'Nearby Nakshatras - Good match' };
  return { score: 1, max: 3, matched: true, detail: 'Nakshatra compatibility - Average' };
}

// Yoni Matching (4 points)
function getYoniMatch(nakshatra1, nakshatra2) {
  if (!nakshatra1 || !nakshatra2) return { score: 0, max: 4, matched: false, detail: 'Nakshatra information not available' };
  
  // Simplified Yoni matching based on nakshatra compatibility
  const sameGroup = nakshatraCompatibility.friendly.some(
    group => group.includes(nakshatra1) && group.includes(nakshatra2)
  );
  
  if (sameGroup) return { score: 4, max: 4, matched: true, detail: 'Same Yoni group - Perfect compatibility' };
  return { score: 2, max: 4, matched: true, detail: 'Yoni compatibility - Moderate' };
}

// Graha Maitri (5 points) - Planetary friendship
function getGrahaMaitri(rashi1, rashi2) {
  if (!rashi1 || !rashi2) return { score: 0, max: 5, matched: false, detail: 'Rashi information not available' };
  
  if (rashiCompatibility[rashi1]?.compatible?.includes(rashi2)) {
    return { score: 5, max: 5, matched: true, detail: 'Planetary friendship - Excellent' };
  }
  if (rashiCompatibility[rashi1]?.neutral?.includes(rashi2)) {
    return { score: 3, max: 5, matched: true, detail: 'Planetary neutrality - Good' };
  }
  return { score: 1, max: 5, matched: true, detail: 'Basic planetary compatibility' };
}

// Gana Matching (6 points)
function getGanaMatch(nakshatra1, nakshatra2) {
  if (!nakshatra1 || !nakshatra2) return { score: 0, max: 6, matched: false, detail: 'Nakshatra information not available' };
  
  const devaGana = ['Ashwini', 'Mrigashira', 'Punarvasu', 'Pushya', 'Hasta', 'Swati', 'Anuradha', 'Shravana'];
  const manushyaGana = ['Bharani', 'Rohini', 'Ardra', 'Purva Phalguni', 'Uttara Phalguni', 'Purva Ashadha', 'Uttara Ashadha', 'Revati'];
  const rakshasaGana = ['Krittika', 'Ashlesha', 'Magha', 'Chitra', 'Vishakha', 'Jyeshtha', 'Mula', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada'];
  
  const gana1 = devaGana.includes(nakshatra1) ? 'deva' : manushyaGana.includes(nakshatra1) ? 'manushya' : 'rakshasa';
  const gana2 = devaGana.includes(nakshatra2) ? 'deva' : manushyaGana.includes(nakshatra2) ? 'manushya' : 'rakshasa';
  
  if (gana1 === gana2) return { score: 6, max: 6, matched: true, detail: 'Same Gana - Perfect match' };
  if ((gana1 === 'deva' && gana2 === 'manushya') || (gana1 === 'manushya' && gana2 === 'deva')) {
    return { score: 3, max: 6, matched: true, detail: 'Deva-Manushya combination - Acceptable' };
  }
  return { score: 0, max: 6, matched: false, detail: 'Incompatible Gana combination - Not recommended' };
}

// Bhakoot Matching (7 points)
function getBhakootMatch(rashi1, rashi2) {
  if (!rashi1 || !rashi2) return { score: 0, max: 7, matched: false, detail: 'Rashi information not available' };
  
  // Bhakoot incompatibility pairs
  const bhakootIncompatible = [
    ['Aries', 'Virgo'], ['Taurus', 'Libra'], ['Gemini', 'Scorpio'],
    ['Cancer', 'Sagittarius'], ['Leo', 'Capricorn'], ['Pisces', 'Aquarius'],
  ];
  
  const isIncompatible = bhakootIncompatible.some(
    pair => (pair[0] === rashi1 && pair[1] === rashi2) || (pair[0] === rashi2 && pair[1] === rashi1)
  );
  
  if (isIncompatible) return { score: 0, max: 7, matched: false, detail: 'Bhakoot incompatible - Not recommended' };
  
  if (rashiCompatibility[rashi1]?.compatible?.includes(rashi2)) {
    return { score: 7, max: 7, matched: true, detail: 'Bhakoot compatible - Excellent' };
  }
  
  return { score: 3, max: 7, matched: true, detail: 'Bhakoot compatibility - Moderate' };
}

// Nadi Matching (8 points) - Most important
function getNadiMatch(nakshatra1, nakshatra2) {
  if (!nakshatra1 || !nakshatra2) return { score: 0, max: 8, matched: false, detail: 'Nakshatra information not available' };
  
  // Adi Nadi
  const adiNadi = ['Ashwini', 'Ardra', 'Punarvasu', 'Uttara Phalguni', 'Hasta', 'Jyeshtha', 'Mula', 'Shravana', 'Purva Bhadrapada'];
  // Madhya Nadi
  const madhyaNadi = ['Bharani', 'Mrigashira', 'Pushya', 'Purva Phalguni', 'Chitra', 'Anuradha', 'Purva Ashadha', 'Dhanishta', 'Uttara Bhadrapada'];
  // Antya Nadi
  const antyaNadi = ['Krittika', 'Rohini', 'Ashlesha', 'Magha', 'Swati', 'Vishakha', 'Uttara Ashadha', 'Shatabhisha', 'Revati'];
  
  const nadi1 = adiNadi.includes(nakshatra1) ? 'adi' : madhyaNadi.includes(nakshatra1) ? 'madhya' : 'antya';
  const nadi2 = adiNadi.includes(nakshatra2) ? 'adi' : madhyaNadi.includes(nakshatra2) ? 'madhya' : 'antya';
  
  if (nadi1 === nadi2) return { score: 0, max: 8, matched: false, detail: 'Same Nadi - Highly incompatible (Dosha)' };
  return { score: 8, max: 8, matched: true, detail: 'Different Nadi - Perfect match' };
}

/**
 * Calculate 36 Gunas matching between two profiles
 */
export const horoscopeService = {
  async calculateMatching(user1, user2) {
    const horoscope1 = user1.horoscopeDetails || {};
    const horoscope2 = user2.horoscopeDetails || {};
    
    const rashi1 = horoscope1.rashi || '';
    const rashi2 = horoscope2.rashi || '';
    const nakshatra1 = horoscope1.nakshatra || '';
    const nakshatra2 = horoscope2.nakshatra || '';
    const starSign1 = horoscope1.starSign || '';
    const starSign2 = horoscope2.starSign || '';
    
    // Check if horoscope data is available
    const hasBasicInfo = (rashi1 && rashi2) || (nakshatra1 && nakshatra2);
    if (!hasBasicInfo) {
      return {
        totalScore: 0,
        maxScore: 36,
        percentage: 0,
        status: 'insufficient_data',
        message: 'Insufficient horoscope information for matching',
        details: [],
      };
    }
    
    // Calculate all 8 aspects
    const varna = getVarnaMatch(rashi1, rashi2);
    const vasya = getVasyaMatch(rashi1, rashi2);
    const tara = getTaraMatch(nakshatra1, nakshatra2);
    const yoni = getYoniMatch(nakshatra1, nakshatra2);
    const grahaMaitri = getGrahaMaitri(rashi1, rashi2);
    const gana = getGanaMatch(nakshatra1, nakshatra2);
    const bhakoot = getBhakootMatch(rashi1, rashi2);
    const nadi = getNadiMatch(nakshatra1, nakshatra2);
    
    const totalScore = varna.score + vasya.score + tara.score + yoni.score + 
                       grahaMaitri.score + gana.score + bhakoot.score + nadi.score;
    const maxScore = 36;
    const percentage = Math.round((totalScore / maxScore) * 100);
    
    // Determine status
    let status = 'excellent';
    let message = 'Excellent compatibility';
    if (percentage >= 75) {
      status = 'excellent';
      message = 'Excellent match! Highly compatible';
    } else if (percentage >= 60) {
      status = 'good';
      message = 'Good match with good compatibility';
    } else if (percentage >= 45) {
      status = 'moderate';
      message = 'Moderate compatibility';
    } else if (percentage >= 30) {
      status = 'average';
      message = 'Average compatibility';
    } else {
      status = 'low';
      message = 'Low compatibility - Not recommended';
    }
    
    // Check for doshas (incompatibilities)
    const doshas = [];
    if (nadi.score === 0) doshas.push('Nadi Dosha - Same Nadi');
    if (gana.score === 0) doshas.push('Gana Dosha - Incompatible Gana');
    if (bhakoot.score === 0) doshas.push('Bhakoot Dosha - Incompatible signs');
    
    return {
      totalScore,
      maxScore,
      percentage,
      status,
      message,
      doshas,
      details: [
        { name: 'Varna', ...varna },
        { name: 'Vasya', ...vasya },
        { name: 'Tara', ...tara },
        { name: 'Yoni', ...yoni },
        { name: 'Graha Maitri', ...grahaMaitri },
        { name: 'Gana', ...gana },
        { name: 'Bhakoot', ...bhakoot },
        { name: 'Nadi', ...nadi },
      ],
      horoscope1: {
        rashi: rashi1,
        nakshatra: nakshatra1,
        starSign: starSign1,
      },
      horoscope2: {
        rashi: rashi2,
        nakshatra: nakshatra2,
        starSign: starSign2,
      },
    };
  },
};

