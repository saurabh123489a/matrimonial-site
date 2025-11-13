/**
 * Migration: Add performance-optimized composite indexes
 * This migration adds additional composite indexes for common query patterns
 * that improve query performance significantly
 */

export async function up(db, mongoose) {
  console.log('  Adding performance indexes...');

  const User = mongoose.model('User');
  const Message = mongoose.model('Message');
  const Interest = mongoose.model('Interest');
  const ProfileView = mongoose.model('ProfileView');

  try {
    // User composite indexes for common search patterns
    console.log('  Creating User composite indexes...');
    await User.collection.createIndex({ isActive: 1, gender: 1, age: 1 }, { background: true });
    await User.collection.createIndex({ isActive: 1, gender: 1, city: 1 }, { background: true });
    await User.collection.createIndex({ isActive: 1, isProfileComplete: 1, gender: 1 }, { background: true });
    await User.collection.createIndex({ isActive: 1, gender: 1, state: 1 }, { background: true });
    await User.collection.createIndex({ isActive: 1, gender: 1, education: 1 }, { background: true });
    await User.collection.createIndex({ isActive: 1, gender: 1, occupation: 1 }, { background: true });
    console.log('  ✓ User composite indexes created');

    // Message composite indexes for conversation queries
    console.log('  Creating Message composite indexes...');
    await Message.collection.createIndex({ senderId: 1, receiverId: 1, createdAt: -1 }, { background: true });
    await Message.collection.createIndex({ senderId: 1, createdAt: -1 }, { background: true });
    console.log('  ✓ Message composite indexes created');

    // Interest composite index for status checks
    console.log('  Creating Interest composite index...');
    await Interest.collection.createIndex({ fromUser: 1, toUser: 1, status: 1 }, { background: true });
    console.log('  ✓ Interest composite index created');

    // ProfileView already has good indexes, but ensure they exist
    console.log('  Verifying ProfileView indexes...');
    await ProfileView.collection.createIndex({ viewerId: 1, viewedUserId: 1, viewedAt: -1 }, { background: true });
    await ProfileView.collection.createIndex({ viewedUserId: 1, viewedAt: -1 }, { background: true });
    console.log('  ✓ ProfileView indexes verified');

    console.log('  ✅ All performance indexes created successfully');
  } catch (error) {
    console.error('  ❌ Error creating indexes:', error.message);
    // Don't throw - indexes may already exist
    if (error.code !== 85 && error.code !== 86) {
      // Error code 85 = IndexOptionsConflict, 86 = IndexKeySpecsConflict
      throw error;
    }
    console.log('  ⚠️  Some indexes may already exist, continuing...');
  }
}

export async function down(db, mongoose) {
  console.log('  Dropping performance indexes...');

  const User = mongoose.model('User');
  const Message = mongoose.model('Message');
  const Interest = mongoose.model('Interest');
  const ProfileView = mongoose.model('ProfileView');

  try {
    // Drop User composite indexes
    await User.collection.dropIndex('isActive_1_gender_1_age_1').catch(() => {});
    await User.collection.dropIndex('isActive_1_gender_1_city_1').catch(() => {});
    await User.collection.dropIndex('isActive_1_isProfileComplete_1_gender_1').catch(() => {});
    await User.collection.dropIndex('isActive_1_gender_1_state_1').catch(() => {});
    await User.collection.dropIndex('isActive_1_gender_1_education_1').catch(() => {});
    await User.collection.dropIndex('isActive_1_gender_1_occupation_1').catch(() => {});

    // Drop Message composite indexes
    await Message.collection.dropIndex('senderId_1_receiverId_1_createdAt_-1').catch(() => {});
    await Message.collection.dropIndex('senderId_1_createdAt_-1').catch(() => {});

    // Drop Interest composite index
    await Interest.collection.dropIndex('fromUser_1_toUser_1_status_1').catch(() => {});

    console.log('  ✅ Performance indexes dropped');
  } catch (error) {
    console.error('  ⚠️  Error dropping indexes:', error.message);
    // Continue even if some indexes don't exist
  }
}

