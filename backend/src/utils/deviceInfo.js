/**
 * Extract device information from request headers
 */
export function getDeviceInfo(req) {
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const ipAddress = req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'] || 'Unknown';
  
  // Parse user agent for platform and browser info
  let platform = 'Unknown';
  let browser = 'Unknown';
  let device = 'Unknown';
  let source = 'browser'; // Default to browser

  if (userAgent) {
    // Source detection: APK vs Mobile Web vs Browser
    const uaLower = userAgent.toLowerCase();
    
    // Check for APK (Android app) - typically has app-specific identifiers
    if (uaLower.includes('ekgahoi') || uaLower.includes('matrimonial') || 
        (uaLower.includes('android') && !uaLower.includes('chrome') && !uaLower.includes('safari') && !uaLower.includes('firefox'))) {
      source = 'apk';
    } 
    // Check for mobile web
    else if (uaLower.includes('mobile') || uaLower.includes('android') || uaLower.includes('iphone') || uaLower.includes('ipad')) {
      source = 'mobile';
    }
    // Otherwise it's a browser (desktop or mobile browser)
    else {
      source = 'browser';
    }

    // Platform detection
    if (userAgent.includes('Windows')) platform = 'Windows';
    else if (userAgent.includes('Mac')) platform = 'macOS';
    else if (userAgent.includes('Linux')) platform = 'Linux';
    else if (userAgent.includes('Android')) platform = 'Android';
    else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) platform = 'iOS';

    // Browser detection
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Edg')) browser = 'Edge';
    else if (userAgent.includes('Opera')) browser = 'Opera';

    // Device type
    if (userAgent.includes('Mobile')) device = 'Mobile';
    else if (userAgent.includes('Tablet')) device = 'Tablet';
    else device = 'Desktop';
  }

  // Create device string
  const deviceString = `${device} - ${platform} - ${browser}`;

  return {
    device: deviceString,
    source, // browser, mobile, or apk
    deviceInfo: {
      userAgent,
      platform,
      browser,
      ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress.split(',')[0],
      location: null, // Can be enhanced with IP geolocation service
    },
  };
}

