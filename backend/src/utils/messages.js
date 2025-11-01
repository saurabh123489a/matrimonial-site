/**
 * Backend API Message Translations
 * Supports English and Hindi
 */

const messages = {
  en: {
    user: {
      created: 'User profile created successfully',
      updated: 'User profile updated successfully',
      deleted: 'User profile deleted successfully',
      notFound: 'User not found',
      retrieved: 'User profile retrieved successfully',
    },
    auth: {
      loginSuccess: 'Login successful',
      invalidCredentials: 'Invalid credentials',
      otpSent: 'OTP sent successfully',
      otpVerified: 'OTP verified successfully',
      invalidOTP: 'Invalid or expired OTP',
    },
    photo: {
      uploaded: 'Photo(s) uploaded successfully',
      deleted: 'Photo deleted successfully',
      primarySet: 'Primary photo updated successfully',
      maxReached: 'Maximum 3 photos allowed',
      noPhoto: 'No photos uploaded',
    },
    interest: {
      sent: 'Interest sent successfully',
      accepted: 'Interest accepted successfully',
      rejected: 'Interest rejected successfully',
      alreadySent: 'Interest already sent',
      notFound: 'Interest not found',
    },
    shortlist: {
      added: 'Added to shortlist successfully',
      removed: 'Removed from shortlist successfully',
      alreadyExists: 'User already in shortlist',
    },
    notification: {
      retrieved: 'Notifications retrieved successfully',
      markedRead: 'Notification marked as read',
      allRead: 'All notifications marked as read',
      deleted: 'Notification deleted successfully',
    },
    profileView: {
      tracked: 'View tracked successfully',
      retrieved: 'Views retrieved successfully',
    },
    message: {
      sent: 'Message sent successfully',
      retrieved: 'Conversation retrieved successfully',
    },
    validation: {
      required: '{field} is required',
      invalidEmail: 'Invalid email format',
      invalidPhone: 'Invalid phone number',
      minLength: '{field} must be at least {min} characters',
      maxLength: '{field} must not exceed {max} characters',
    },
    error: {
      serverError: 'Internal server error',
      notFound: 'Resource not found',
      unauthorized: 'Unauthorized access',
      forbidden: 'Access forbidden',
    },
  },
  hi: {
    user: {
      created: 'उपयोगकर्ता प्रोफ़ाइल सफलतापूर्वक बनाई गई',
      updated: 'उपयोगकर्ता प्रोफ़ाइल सफलतापूर्वक अपडेट की गई',
      deleted: 'उपयोगकर्ता प्रोफ़ाइल सफलतापूर्वक हटाई गई',
      notFound: 'उपयोगकर्ता नहीं मिला',
      retrieved: 'उपयोगकर्ता प्रोफ़ाइल सफलतापूर्वक प्राप्त की गई',
    },
    auth: {
      loginSuccess: 'लॉगिन सफल',
      invalidCredentials: 'अमान्य क्रेडेंशियल',
      otpSent: 'OTP सफलतापूर्वक भेजा गया',
      otpVerified: 'OTP सफलतापूर्वक सत्यापित किया गया',
      invalidOTP: 'अमान्य या समाप्त OTP',
    },
    photo: {
      uploaded: 'तस्वीर(ें) सफलतापूर्वक अपलोड की गई',
      deleted: 'तस्वीर सफलतापूर्वक हटाई गई',
      primarySet: 'प्राथमिक तस्वीर सफलतापूर्वक अपडेट की गई',
      maxReached: 'अधिकतम 3 तस्वीरें अनुमत',
      noPhoto: 'कोई तस्वीर अपलोड नहीं की गई',
    },
    interest: {
      sent: 'रुचि सफलतापूर्वक भेजी गई',
      accepted: 'रुचि सफलतापूर्वक स्वीकार की गई',
      rejected: 'रुचि सफलतापूर्वक अस्वीकार की गई',
      alreadySent: 'रुचि पहले से भेजी गई है',
      notFound: 'रुचि नहीं मिली',
    },
    shortlist: {
      added: 'शॉर्टलिस्ट में सफलतापूर्वक जोड़ा गया',
      removed: 'शॉर्टलिस्ट से सफलतापूर्वक हटाया गया',
      alreadyExists: 'उपयोगकर्ता पहले से शॉर्टलिस्ट में है',
    },
    notification: {
      retrieved: 'सूचनाएं सफलतापूर्वक प्राप्त की गईं',
      markedRead: 'सूचना पढ़ी गई के रूप में चिह्नित की गई',
      allRead: 'सभी सूचनाएं पढ़ी गई के रूप में चिह्नित की गईं',
      deleted: 'सूचना सफलतापूर्वक हटाई गई',
    },
    profileView: {
      tracked: 'दृश्य सफलतापूर्वक ट्रैक किया गया',
      retrieved: 'दृश्य सफलतापूर्वक प्राप्त किए गए',
    },
    message: {
      sent: 'संदेश सफलतापूर्वक भेजा गया',
      retrieved: 'बातचीत सफलतापूर्वक प्राप्त की गई',
    },
    validation: {
      required: '{field} आवश्यक है',
      invalidEmail: 'अमान्य ईमेल प्रारूप',
      invalidPhone: 'अमान्य फोन नंबर',
      minLength: '{field} कम से कम {min} वर्ण होना चाहिए',
      maxLength: '{field} {max} वर्णों से अधिक नहीं होना चाहिए',
    },
    error: {
      serverError: 'आंतरिक सर्वर त्रुटि',
      notFound: 'संसाधन नहीं मिला',
      unauthorized: 'अनधिकृत पहुंच',
      forbidden: 'पहुंच निषिद्ध',
    },
  },
};

/**
 * Get translated message
 * @param {string} key - Message key (e.g., 'user.created')
 * @param {string} lang - Language code ('en' or 'hi')
 * @param {object} params - Parameters to replace in message
 * @returns {string}
 */
export function getMessage(key, lang = 'en', params = {}) {
  const langMessages = messages[lang] || messages.en;
  const keys = key.split('.');
  let message = langMessages;

  for (const k of keys) {
    if (message && typeof message === 'object' && k in message) {
      message = message[k];
    } else {
      // Fallback to English
      if (lang !== 'en') {
        return getMessage(key, 'en', params);
      }
      return key;
    }
  }

  if (typeof message !== 'string') {
    return key;
  }

  // Replace parameters
  return message.replace(/\{(\w+)\}/g, (match, paramKey) => {
    return params[paramKey]?.toString() || match;
  });
}

export default messages;

