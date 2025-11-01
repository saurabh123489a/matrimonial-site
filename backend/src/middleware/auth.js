import jwt from 'jsonwebtoken';
import { sessionRepository } from '../repositories/sessionRepository.js';

/**
 * Authentication middleware
 * Verifies JWT token and validates active session
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        status: false,
        message: 'Authorization header is required'
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({
        status: false,
        message: 'Token is required'
      });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          status: false,
          message: 'Invalid token'
        });
      }
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: false,
          message: 'Token expired'
        });
      }
      return res.status(401).json({
        status: false,
        message: 'Token verification failed'
      });
    }

    const userId = decoded.sub || decoded.userId;

    // Validate session - check if token has an active session
    const session = await sessionRepository.findByToken(token);
    
    if (!session) {
      return res.status(401).json({
        status: false,
        message: 'Session not found or expired'
      });
    }

    if (!session.isActive) {
      return res.status(401).json({
        status: false,
        message: 'Session is inactive'
      });
    }

    // Check if session has expired
    if (session.expiresAt < new Date()) {
      // Deactivate expired session
      await sessionRepository.deactivate(session._id);
      return res.status(401).json({
        status: false,
        message: 'Session expired'
      });
    }

    // Verify session userId matches token userId
    const sessionUserId = String(session.userId._id || session.userId);
    if (sessionUserId !== String(userId)) {
      return res.status(401).json({
        status: false,
        message: 'Session user mismatch'
      });
    }

    // Update session activity
    await sessionRepository.updateActivity(session._id);

    // Attach user data from session to request object
    req.user = { 
      id: sessionUserId,
      sessionId: session._id,
      userType: session.userType,
      name: session.name
    };
    
    // Store session object for profile fetching
    req.session = session;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      status: false,
      message: 'Authentication failed'
    });
  }
};

// Alias for backwards compatibility
export const authenticate = requireAuth;

/**
 * Optional authentication middleware
 * Verifies JWT token and session if present, but doesn't fail if missing
 * Useful for routes that work for both authenticated and anonymous users
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next(); // Continue without authentication
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      return next(); // Continue without authentication
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.sub || decoded.userId;

      // Check for active session
      const session = await sessionRepository.findByToken(token);
      
      if (session && session.isActive && session.expiresAt >= new Date()) {
        const sessionUserId = String(session.userId._id || session.userId);
        if (sessionUserId === String(userId)) {
          // Update session activity
          await sessionRepository.updateActivity(session._id);
          
          // Attach user data from session
          req.user = { 
            id: sessionUserId,
            sessionId: session._id,
            userType: session.userType,
            name: session.name
          };
          req.session = session;
        }
      }
      // If session check fails, still try to set user from token (for backward compatibility)
      else if (!req.user) {
        req.user = { id: userId };
      }
    } catch (error) {
      // Invalid token or session, but continue without authentication
      // Don't set req.user
    }
    
    next();
  } catch (error) {
    // If there's any error, continue without authentication
    next();
  }
};
