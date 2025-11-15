/**
 * Generate VAPID keys for push notifications
 * Run: node scripts/generateVapidKeys.js
 */

import webpush from 'web-push';

console.log('Generating VAPID keys for push notifications...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('VAPID Keys Generated Successfully!\n');
console.log('Add these to your .env file:\n');
console.log('VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('VAPID_EMAIL=mailto:your-email@example.com\n');
console.log('Note: Keep the private key secure and never commit it to version control!');

