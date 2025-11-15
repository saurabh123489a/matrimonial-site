# Push Notifications Setup Guide

## Overview
This guide explains how to set up and configure push notifications for the matrimonial application.

## Prerequisites
- Node.js backend with `web-push` package installed
- HTTPS enabled (required for push notifications)
- Browser support for Service Workers and Push API

## Backend Setup

### 1. Generate VAPID Keys

Run the following command to generate VAPID keys:

```bash
cd backend
node scripts/generateVapidKeys.js
```

This will output:
- `VAPID_PUBLIC_KEY` - Public key (safe to expose)
- `VAPID_PRIVATE_KEY` - Private key (keep secure!)
- `VAPID_EMAIL` - Contact email for VAPID

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_EMAIL=mailto:your-email@example.com
```

**Important:** Never commit the private key to version control!

### 3. Verify Installation

The push notification service is automatically initialized when the server starts. Check the logs to ensure there are no errors.

## Frontend Setup

### 1. Service Worker

The service worker (`/public/sw.js`) is automatically registered when users enable push notifications.

### 2. User Subscription

Users can enable push notifications from:
- Settings page (`/settings`)
- Push notification button component

### 3. Browser Requirements

Push notifications require:
- HTTPS (or localhost for development)
- User permission granted
- Service Worker support

## API Endpoints

### Get VAPID Public Key
```
GET /api/push/vapid-key
```
Returns the public VAPID key for frontend subscription.

### Subscribe
```
POST /api/push/subscribe
Authorization: Bearer <token>
Body: {
  subscription: {
    endpoint: string,
    keys: {
      p256dh: string,
      auth: string
    }
  },
  userAgent?: string,
  device?: string
}
```

### Unsubscribe
```
POST /api/push/unsubscribe
Authorization: Bearer <token>
Body: {
  endpoint: string
}
```

### Get Subscriptions
```
GET /api/push/subscriptions
Authorization: Bearer <token>
```

## How It Works

1. **User enables push notifications** → Frontend requests browser permission
2. **Browser creates subscription** → Service worker registers with push service
3. **Subscription sent to backend** → Stored in database with user ID
4. **Notification created** → Backend automatically sends push notification
5. **User receives notification** → Browser displays notification
6. **User clicks notification** → Opens relevant page in app

## Notification Types

Push notifications are automatically sent for:
- `message_received` - New message
- `interest_received` - Someone sent interest
- `interest_accepted` - Interest accepted
- `profile_view` - Profile viewed
- `shortlist` - Added to shortlist
- `admin` - Admin notifications

## Testing

### Development (localhost)
- Works without HTTPS
- Use Chrome/Firefox for best support

### Production
- Requires HTTPS
- Test on actual devices
- Verify VAPID keys are correct

## Troubleshooting

### Notifications not working?
1. Check browser console for errors
2. Verify VAPID keys are set correctly
3. Ensure HTTPS is enabled (production)
4. Check service worker registration
5. Verify user granted permission

### Subscription fails?
1. Check network tab for API errors
2. Verify authentication token
3. Check backend logs for errors
4. Ensure VAPID keys match

### Notifications not received?
1. Check subscription is active in database
2. Verify notification service is called
3. Check browser notification settings
4. Test with a simple notification first

## Security Notes

- VAPID private key must be kept secret
- Subscriptions are user-specific
- Expired subscriptions are automatically cleaned up
- Users can unsubscribe at any time

## Future Enhancements

- Notification preferences per type
- Quiet hours
- Notification grouping
- Rich notifications with images
- Action buttons in notifications

