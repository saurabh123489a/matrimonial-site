/**
 * Meta Data Controller - Provides static/API data for dropdowns
 * Education, Occupation options
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
 * Returns only major occupation fields
 */
export const getOccupationOptions = async (req, res, next) => {
  try {
    const { gender } = req.query; // Optional gender parameter to prioritize options
    
    // Major occupation fields only
    const occupationOptions = [
      { value: 'software-engineer', label: 'Software Engineer / IT Professional' },
      { value: 'doctor', label: 'Doctor / Physician' },
      { value: 'engineer', label: 'Engineer (Civil/Mechanical/Electrical)' },
      { value: 'teacher', label: 'Teacher / Professor' },
      { value: 'lawyer', label: 'Lawyer / Advocate' },
      { value: 'ca', label: 'CA / Chartered Accountant' },
      { value: 'cs', label: 'CS / Company Secretary' },
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
      { value: 'veterinarian', label: 'Veterinarian' },
      { value: 'accountant', label: 'Accountant' },
      { value: 'chef', label: 'Chef / Cook' },
      { value: 'homemaker', label: 'Home Maker / House Wife' },
      { value: 'student', label: 'Student' },
      { value: 'retired', label: 'Retired' },
      { value: 'other', label: 'Other' },
    ];

    // If gender is female, prioritize "homemaker" by moving it to the top
    if (gender === 'female') {
      const homemakerIndex = occupationOptions.findIndex(opt => opt.value === 'homemaker');
      if (homemakerIndex > -1) {
        const homemakerOption = occupationOptions.splice(homemakerIndex, 1)[0];
        // Insert after "student" but before "retired" for better visibility
        const studentIndex = occupationOptions.findIndex(opt => opt.value === 'student');
        if (studentIndex > -1) {
          occupationOptions.splice(studentIndex + 1, 0, homemakerOption);
        } else {
          // If student not found, insert at the beginning
          occupationOptions.unshift(homemakerOption);
        }
      }
    }

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
 * Get Profession Options based on Occupation
 * GET /api/meta/profession?occupation=software-engineer
 */
export const getProfessionOptions = async (req, res, next) => {
  try {
    const { occupation } = req.query;
    
    if (!occupation) {
      return res.json({
        status: true,
        message: 'Profession options retrieved successfully',
        data: []
      });
    }

    // Map occupations to their related professions
    const professionMap = {
      'software-engineer': [
        { value: 'full-stack-developer', label: 'Full Stack Developer' },
        { value: 'frontend-developer', label: 'Frontend Developer' },
        { value: 'backend-developer', label: 'Backend Developer' },
        { value: 'mobile-app-developer', label: 'Mobile App Developer' },
        { value: 'devops-engineer', label: 'DevOps Engineer' },
        { value: 'cloud-engineer', label: 'Cloud Engineer' },
        { value: 'data-engineer', label: 'Data Engineer' },
        { value: 'ai-ml-engineer', label: 'AI/ML Engineer' },
        { value: 'cybersecurity-engineer', label: 'Cybersecurity Engineer' },
        { value: 'qa-engineer', label: 'QA/Test Engineer' },
        { value: 'system-administrator', label: 'System Administrator' },
        { value: 'database-administrator', label: 'Database Administrator' },
        { value: 'network-engineer', label: 'Network Engineer' },
        { value: 'it-consultant', label: 'IT Consultant' },
        { value: 'technical-architect', label: 'Technical Architect' },
        { value: 'other-it', label: 'Other IT Professional' },
      ],
      'doctor': [
        { value: 'general-physician', label: 'General Physician' },
        { value: 'surgeon', label: 'Surgeon' },
        { value: 'gynecologist', label: 'Gynecologist' },
        { value: 'pediatrician', label: 'Pediatrician' },
        { value: 'cardiologist', label: 'Cardiologist' },
        { value: 'dermatologist', label: 'Dermatologist' },
        { value: 'ophthalmologist', label: 'Ophthalmologist' },
        { value: 'orthopedic-surgeon', label: 'Orthopedic Surgeon' },
        { value: 'neurologist', label: 'Neurologist' },
        { value: 'psychiatrist', label: 'Psychiatrist' },
        { value: 'anesthesiologist', label: 'Anesthesiologist' },
        { value: 'radiologist', label: 'Radiologist' },
        { value: 'pathologist', label: 'Pathologist' },
        { value: 'ent-specialist', label: 'ENT Specialist' },
        { value: 'urologist', label: 'Urologist' },
        { value: 'oncology', label: 'Oncologist' },
        { value: 'other-doctor', label: 'Other Medical Specialist' },
      ],
      'engineer': [
        { value: 'civil-engineer', label: 'Civil Engineer' },
        { value: 'mechanical-engineer', label: 'Mechanical Engineer' },
        { value: 'electrical-engineer', label: 'Electrical Engineer' },
        { value: 'electronics-engineer', label: 'Electronics Engineer' },
        { value: 'chemical-engineer', label: 'Chemical Engineer' },
        { value: 'aerospace-engineer', label: 'Aerospace Engineer' },
        { value: 'automotive-engineer', label: 'Automotive Engineer' },
        { value: 'biomedical-engineer', label: 'Biomedical Engineer' },
        { value: 'environmental-engineer', label: 'Environmental Engineer' },
        { value: 'industrial-engineer', label: 'Industrial Engineer' },
        { value: 'marine-engineer', label: 'Marine Engineer' },
        { value: 'mining-engineer', label: 'Mining Engineer' },
        { value: 'petroleum-engineer', label: 'Petroleum Engineer' },
        { value: 'structural-engineer', label: 'Structural Engineer' },
        { value: 'project-engineer', label: 'Project Engineer' },
        { value: 'other-engineer', label: 'Other Engineer' },
      ],
      'teacher': [
        { value: 'school-teacher', label: 'School Teacher' },
        { value: 'college-professor', label: 'College Professor' },
        { value: 'university-professor', label: 'University Professor' },
        { value: 'principal', label: 'Principal / School Head' },
        { value: 'vice-principal', label: 'Vice Principal' },
        { value: 'tuition-teacher', label: 'Tuition Teacher' },
        { value: 'online-tutor', label: 'Online Tutor' },
        { value: 'coaching-instructor', label: 'Coaching Instructor' },
        { value: 'special-educator', label: 'Special Educator' },
        { value: 'other-teacher', label: 'Other Teaching Professional' },
      ],
      'lawyer': [
        { value: 'criminal-lawyer', label: 'Criminal Lawyer' },
        { value: 'civil-lawyer', label: 'Civil Lawyer' },
        { value: 'corporate-lawyer', label: 'Corporate Lawyer' },
        { value: 'tax-lawyer', label: 'Tax Lawyer' },
        { value: 'family-lawyer', label: 'Family Lawyer' },
        { value: 'property-lawyer', label: 'Property Lawyer' },
        { value: 'immigration-lawyer', label: 'Immigration Lawyer' },
        { value: 'intellectual-property-lawyer', label: 'IP Lawyer' },
        { value: 'legal-advisor', label: 'Legal Advisor' },
        { value: 'other-lawyer', label: 'Other Legal Professional' },
      ],
      'ca': [
        { value: 'ca-practicing', label: 'CA (Practicing)' },
        { value: 'ca-industry', label: 'CA (Industry)' },
        { value: 'ca-consultant', label: 'CA (Consultant)' },
        { value: 'ca-auditor', label: 'CA (Auditor)' },
        { value: 'ca-tax-consultant', label: 'CA (Tax Consultant)' },
        { value: 'other-ca', label: 'Other CA' },
      ],
      'business': [
        { value: 'business-owner', label: 'Business Owner' },
        { value: 'entrepreneur', label: 'Entrepreneur' },
        { value: 'startup-founder', label: 'Startup Founder' },
        { value: 'franchise-owner', label: 'Franchise Owner' },
        { value: 'retailer', label: 'Retailer' },
        { value: 'wholesaler', label: 'Wholesaler' },
        { value: 'manufacturer', label: 'Manufacturer' },
        { value: 'trader', label: 'Trader' },
        { value: 'exporter', label: 'Exporter' },
        { value: 'importer', label: 'Importer' },
        { value: 'other-business', label: 'Other Business Professional' },
      ],
      'banking': [
        { value: 'bank-manager', label: 'Bank Manager' },
        { value: 'relationship-manager', label: 'Relationship Manager' },
        { value: 'loan-officer', label: 'Loan Officer' },
        { value: 'investment-banker', label: 'Investment Banker' },
        { value: 'financial-analyst', label: 'Financial Analyst' },
        { value: 'credit-analyst', label: 'Credit Analyst' },
        { value: 'teller', label: 'Bank Teller' },
        { value: 'other-banking', label: 'Other Banking Professional' },
      ],
      'government': [
        { value: 'ias-officer', label: 'IAS Officer' },
        { value: 'ips-officer', label: 'IPS Officer' },
        { value: 'ifs-officer', label: 'IFS Officer' },
        { value: 'government-clerk', label: 'Government Clerk' },
        { value: 'government-officer', label: 'Government Officer' },
        { value: 'pwd-engineer', label: 'PWD Engineer' },
        { value: 'other-government', label: 'Other Government Employee' },
      ],
      'designer': [
        { value: 'graphic-designer', label: 'Graphic Designer' },
        { value: 'interior-designer', label: 'Interior Designer' },
        { value: 'fashion-designer', label: 'Fashion Designer' },
        { value: 'ui-ux-designer', label: 'UI/UX Designer' },
        { value: 'web-designer', label: 'Web Designer' },
        { value: 'jewelry-designer', label: 'Jewelry Designer' },
        { value: 'other-designer', label: 'Other Designer' },
      ],
      'manager': [
        { value: 'project-manager', label: 'Project Manager' },
        { value: 'product-manager', label: 'Product Manager' },
        { value: 'operations-manager', label: 'Operations Manager' },
        { value: 'sales-manager', label: 'Sales Manager' },
        { value: 'marketing-manager', label: 'Marketing Manager' },
        { value: 'hr-manager', label: 'HR Manager' },
        { value: 'finance-manager', label: 'Finance Manager' },
        { value: 'general-manager', label: 'General Manager' },
        { value: 'other-manager', label: 'Other Manager' },
      ],
    };

    // Get professions for the selected occupation
    const professions = professionMap[occupation] || [];

    res.json({
      status: true,
      message: 'Profession options retrieved successfully',
      data: professions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Salary Range Options (Annual Income)
 * GET /api/meta/salary
 * Returns annual income ranges in format like "25-30 lakh", "1-2 Cr", etc.
 */
export const getSalaryOptions = async (req, res, next) => {
  try {
    const salaryOptions = [
      { value: '0-1 lakh', label: 'Less than 1 lakh' },
      { value: '1-2 lakh', label: '1-2 lakh' },
      { value: '2-3 lakh', label: '2-3 lakh' },
      { value: '3-4 lakh', label: '3-4 lakh' },
      { value: '4-5 lakh', label: '4-5 lakh' },
      { value: '5-7 lakh', label: '5-7 lakh' },
      { value: '7-10 lakh', label: '7-10 lakh' },
      { value: '10-15 lakh', label: '10-15 lakh' },
      { value: '15-20 lakh', label: '15-20 lakh' },
      { value: '20-25 lakh', label: '20-25 lakh' },
      { value: '25-30 lakh', label: '25-30 lakh' },
      { value: '30-40 lakh', label: '30-40 lakh' },
      { value: '40-50 lakh', label: '40-50 lakh' },
      { value: '50-75 lakh', label: '50-75 lakh' },
      { value: '75 lakh-1 Cr', label: '75 lakh - 1 Cr' },
      { value: '1-1.5 Cr', label: '1-1.5 Cr' },
      { value: '1.5-2 Cr', label: '1.5-2 Cr' },
      { value: '2-3 Cr', label: '2-3 Cr' },
      { value: '3-5 Cr', label: '3-5 Cr' },
      { value: '5 Cr+', label: '5 Cr and above' },
      { value: 'Not disclosed', label: 'Not disclosed' },
    ];

    res.json({
      status: true,
      message: 'Salary options retrieved successfully',
      data: salaryOptions
    });
  } catch (error) {
    next(error);
  }
};

