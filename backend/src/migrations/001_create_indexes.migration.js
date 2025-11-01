/**
 * Migration: Create database indexes for optimized queries
 * This migration creates indexes on frequently queried fields
 */

export async function up(db, mongoose) {
  console.log('  Creating indexes...');

  const User = mongoose.model('User');
  const Interest = mongoose.model('Interest');
  const Shortlist = mongoose.model('Shortlist');
  const Question = mongoose.model('Question');
  const Answer = mongoose.model('Answer');
  const Vote = mongoose.model('Vote');

  // User indexes
  await User.collection.createIndex({ email: 1 }, { unique: true, sparse: true });
  await User.collection.createIndex({ phone: 1 }, { unique: true, sparse: true });
  await User.collection.createIndex({ gender: 1, age: 1 });
  await User.collection.createIndex({ city: 1, state: 1, country: 1 });
  await User.collection.createIndex({ religion: 1 });
  await User.collection.createIndex({ 'photos.isPrimary': 1 });
  await User.collection.createIndex({ isActive: 1, isProfileComplete: 1 });
  console.log('  ✓ User indexes created');

  // Interest indexes
  await Interest.collection.createIndex({ fromUser: 1, toUser: 1 }, { unique: true });
  await Interest.collection.createIndex({ toUser: 1, status: 1 });
  await Interest.collection.createIndex({ fromUser: 1, status: 1 });
  await Interest.collection.createIndex({ status: 1, createdAt: -1 });
  console.log('  ✓ Interest indexes created');

  // Shortlist indexes
  await Shortlist.collection.createIndex({ userId: 1, shortlistedUserId: 1 }, { unique: true });
  await Shortlist.collection.createIndex({ userId: 1 });
  await Shortlist.collection.createIndex({ createdAt: -1 });
  console.log('  ✓ Shortlist indexes created');

  // Question indexes
  await Question.collection.createIndex({ author: 1 });
  await Question.collection.createIndex({ category: 1, tags: 1 });
  await Question.collection.createIndex({ isSolved: 1, createdAt: -1 });
  await Question.collection.createIndex({ upvotes: -1 });
  await Question.collection.createIndex({ createdAt: -1 });
  await Question.collection.createIndex({ tags: 1 }); // For tag-based searches
  console.log('  ✓ Question indexes created');

  // Answer indexes
  await Answer.collection.createIndex({ question: 1 });
  await Answer.collection.createIndex({ author: 1 });
  await Answer.collection.createIndex({ isAccepted: 1, upvotes: -1 });
  await Answer.collection.createIndex({ createdAt: -1 });
  console.log('  ✓ Answer indexes created');

  // Vote indexes
  await Vote.collection.createIndex({ user: 1, targetType: 1, targetId: 1 }, { unique: true });
  await Vote.collection.createIndex({ targetType: 1, targetId: 1 });
  console.log('  ✓ Vote indexes created');

  console.log('  ✅ All indexes created successfully');
}

export async function down(db, mongoose) {
  console.log('  Dropping indexes...');

  const User = mongoose.model('User');
  const Interest = mongoose.model('Interest');
  const Shortlist = mongoose.model('Shortlist');
  const Question = mongoose.model('Question');
  const Answer = mongoose.model('Answer');
  const Vote = mongoose.model('Vote');

  await User.collection.dropIndexes();
  await Interest.collection.dropIndexes();
  await Shortlist.collection.dropIndexes();
  await Question.collection.dropIndexes();
  await Answer.collection.dropIndexes();
  await Vote.collection.dropIndexes();

  console.log('  ✅ All indexes dropped');
}

