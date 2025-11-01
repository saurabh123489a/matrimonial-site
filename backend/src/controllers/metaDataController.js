/**
 * Meta Data Controller - Provides static/API data for dropdowns
 * Education, Occupation, Religion options
 */

/**
 * Get Education Options
 * GET /api/meta/education
 */
export const getEducationOptions = async (req, res, next) => {
  try {
    // Common education levels/degrees in India
    const educationOptions = [
      { value: '10th', label: '10th / SSC' },
      { value: '12th', label: '12th / HSC' },
      { value: 'diploma', label: 'Diploma' },
      { value: 'graduate', label: 'Graduate / Bachelor\'s Degree' },
      { value: 'btech', label: 'B.Tech / B.E.' },
      { value: 'mba', label: 'MBA' },
      { value: 'mtech', label: 'M.Tech / M.E.' },
      { value: 'mca', label: 'MCA' },
      { value: 'bca', label: 'BCA' },
      { value: 'bcom', label: 'B.Com' },
      { value: 'mcom', label: 'M.Com' },
      { value: 'ba', label: 'B.A.' },
      { value: 'ma', label: 'M.A.' },
      { value: 'bsc', label: 'B.Sc' },
      { value: 'msc', label: 'M.Sc' },
      { value: 'bba', label: 'BBA' },
      { value: 'mbb', label: 'MBB / MBBS' },
      { value: 'md', label: 'MD / MS' },
      { value: 'phd', label: 'Ph.D' },
      { value: 'ca', label: 'CA' },
      { value: 'cs', label: 'CS' },
      { value: 'icwa', label: 'ICWA' },
      { value: 'llb', label: 'LLB' },
      { value: 'llm', label: 'LLM' },
      { value: 'other', label: 'Other' },
    ];

    res.json({
      status: true,
      message: 'Education options retrieved successfully',
      data: educationOptions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Occupation Options
 * GET /api/meta/occupation
 */
export const getOccupationOptions = async (req, res, next) => {
  try {
    // Common occupations in India
    const occupationOptions = [
      { value: 'software-engineer', label: 'Software Engineer / IT Professional' },
      { value: 'doctor', label: 'Doctor / Physician' },
      { value: 'engineer', label: 'Engineer (Civil/Mechanical/Electrical)' },
      { value: 'teacher', label: 'Teacher / Professor' },
      { value: 'lawyer', label: 'Lawyer / Advocate' },
      { value: 'ca', label: 'CA / Chartered Accountant' },
      { value: 'business', label: 'Business / Entrepreneur' },
      { value: 'government', label: 'Government Employee' },
      { value: 'banking', label: 'Banking / Finance Professional' },
      { value: 'marketing', label: 'Marketing / Sales Professional' },
      { value: 'hr', label: 'HR / Human Resources' },
      { value: 'nurse', label: 'Nurse / Healthcare Professional' },
      { value: 'pharmacist', label: 'Pharmacist' },
      { value: 'architect', label: 'Architect' },
      { value: 'designer', label: 'Designer (Graphic/Interior/Fashion)' },
      { value: 'journalist', label: 'Journalist / Media Professional' },
      { value: 'scientist', label: 'Scientist / Researcher' },
      { value: 'pilot', label: 'Pilot / Aviation' },
      { value: 'military', label: 'Defense / Military' },
      { value: 'policeman', label: 'Police / Security' },
      { value: 'artist', label: 'Artist / Creative Professional' },
      { value: 'consultant', label: 'Consultant' },
      { value: 'manager', label: 'Manager / Executive' },
      { value: 'dentist', label: 'Dentist' },
      { value: 'pharmacist', label: 'Pharmacist' },
      { value: 'veterinarian', label: 'Veterinarian' },
      { value: 'accountant', label: 'Accountant' },
      { value: 'chef', label: 'Chef / Cook' },
      { value: 'homemaker', label: 'Home Maker' },
      { value: 'student', label: 'Student' },
      { value: 'retired', label: 'Retired' },
      { value: 'other', label: 'Other' },
    ];

    res.json({
      status: true,
      message: 'Occupation options retrieved successfully',
      data: occupationOptions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Religion Options
 * GET /api/meta/religion
 */
export const getReligionOptions = async (req, res, next) => {
  try {
    // Common religions in India
    const religionOptions = [
      { value: 'hindu', label: 'Hindu' },
      { value: 'muslim', label: 'Muslim / Islam' },
      { value: 'christian', label: 'Christian' },
      { value: 'sikh', label: 'Sikh' },
      { value: 'jain', label: 'Jain' },
      { value: 'buddhist', label: 'Buddhist' },
      { value: 'parsi', label: 'Parsi / Zoroastrian' },
      { value: 'jewish', label: 'Jewish' },
      { value: 'bahai', label: 'Bahá\'í' },
      { value: 'other', label: 'Other' },
    ];

    res.json({
      status: true,
      message: 'Religion options retrieved successfully',
      data: religionOptions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Salary Range Options
 * GET /api/meta/salary
 * Returns salary ranges from 3L to 50L in 3L intervals
 * Format: Less than 3L, 3-6L, 6-9L, 9-12L, ..., 45-48L, 48-50L, 50L+
 */
export const getSalaryOptions = async (req, res, next) => {
  try {
    const salaryOptions = [];
    
    // Add "Less than 3L" option
    salaryOptions.push({
      value: 0,
      label: 'Less than ₹3L',
      min: 0,
      max: 299999,
    });
    
    // Generate salary ranges: 3-6L, 6-9L, 9-12L, ..., 45-48L, 48-50L
    for (let i = 3; i < 50; i += 3) {
      const nextValue = Math.min(i + 3, 50); // Cap at 50L
      
      if (nextValue === 50) {
        // Special case: 48-50L range
        salaryOptions.push({
          value: i * 100000,
          label: `₹${i}L - ₹${nextValue}L`,
          min: i * 100000,
          max: nextValue * 100000,
        });
      } else {
        salaryOptions.push({
          value: i * 100000,
          label: `₹${i}L - ₹${nextValue}L`,
          min: i * 100000,
          max: (nextValue * 100000) - 1, // Up to but not including next range
        });
      }
    }
    
    // Add "50L+" option
    salaryOptions.push({
      value: 5000000,
      label: '₹50L+',
      min: 5000000,
      max: null, // No upper limit
    });

    res.json({
      status: true,
      message: 'Salary options retrieved successfully',
      data: salaryOptions
    });
  } catch (error) {
    next(error);
  }
};

