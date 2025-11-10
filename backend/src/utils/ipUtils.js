/**
 * Utility functions for IP address handling
 */

/**
 * Get client IP address from request
 * Handles proxies and load balancers
 */
export function getClientIp(req) {
  // Check X-Forwarded-For header (for proxies/load balancers)
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    return ips[0];
  }
  
  // Check X-Real-IP header
  if (req.headers['x-real-ip']) {
    return req.headers['x-real-ip'];
  }
  
  // Fallback to connection remote address
  if (req.connection && req.connection.remoteAddress) {
    return req.connection.remoteAddress;
  }
  
  // Fallback to socket remote address
  if (req.socket && req.socket.remoteAddress) {
    return req.socket.remoteAddress;
  }
  
  return 'unknown';
}

/**
 * Check if IP is from a known proxy/VPN service
 */
export function isProxyIp(ip) {
  // This is a simplified check - in production, use a proper IP geolocation service
  // For now, we'll just return false
  return false;
}

