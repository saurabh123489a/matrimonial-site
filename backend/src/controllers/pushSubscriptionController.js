import { pushSubscriptionService } from '../services/pushSubscriptionService.js';
import { pushNotificationService } from '../services/pushNotificationService.js';

/**
 * Get VAPID public key
 * GET /api/push/vapid-key
 */
export const getVapidKey = async (req, res, next) => {
  try {
    const publicKey = pushNotificationService.getVapidPublicKey();
    
    if (!publicKey) {
      return res.status(503).json({
        status: false,
        message: 'Push notifications are not configured',
      });
    }

    return res.json({
      status: true,
      data: { publicKey },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Subscribe to push notifications
 * POST /api/push/subscribe
 */
export const subscribe = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { subscription, userAgent, device } = req.body;

    if (!userId) {
      return res.status(401).json({
        status: false,
        message: 'Authentication required',
      });
    }

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({
        status: false,
        message: 'Invalid subscription object',
      });
    }

    const result = await pushSubscriptionService.subscribe(userId, subscription, {
      userAgent,
      device,
    });

    return res.json({
      status: true,
      message: 'Successfully subscribed to push notifications',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Unsubscribe from push notifications
 * POST /api/push/unsubscribe
 */
export const unsubscribe = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { endpoint } = req.body;

    if (!userId) {
      return res.status(401).json({
        status: false,
        message: 'Authentication required',
      });
    }

    if (!endpoint) {
      return res.status(400).json({
        status: false,
        message: 'Endpoint is required',
      });
    }

    await pushSubscriptionService.unsubscribe(userId, endpoint);

    return res.json({
      status: true,
      message: 'Successfully unsubscribed from push notifications',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get user's push subscriptions
 * GET /api/push/subscriptions
 */
export const getSubscriptions = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;

    if (!userId) {
      return res.status(401).json({
        status: false,
        message: 'Authentication required',
      });
    }

    const subscriptions = await pushSubscriptionService.getUserSubscriptions(userId);

    return res.json({
      status: true,
      data: subscriptions,
    });
  } catch (err) {
    next(err);
  }
};

