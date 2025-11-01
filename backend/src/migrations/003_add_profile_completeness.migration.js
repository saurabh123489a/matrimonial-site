/**
 * Migration: Calculate and update profile completeness for all users
 * This migration recalculates the isProfileComplete flag for all existing users
 */

export async function up(db, mongoose) {
  console.log('  Calculating profile completeness...');

  const User = mongoose.model('User');

  // Define required fields for profile completeness
  const requiredFields = [
    'name',
    'gender',
    'dateOfBirth',
    'city',
    'country',
    'religion',
    'education',
    'occupation',
    'bio',
  ];

  // Get all users
  const users = await User.find({});

  let updatedCount = 0;

  for (const user of users) {
    let isComplete = true;

    // Check required fields
    for (const field of requiredFields) {
      if (!user[field] || (typeof user[field] === 'string' && user[field].trim() === '')) {
        isComplete = false;
        break;
      }
    }

    // Check if user has at least one photo
    if (!user.photos || user.photos.length === 0) {
      isComplete = false;
    }

    // Update if completeness status has changed
    if (user.isProfileComplete !== isComplete) {
      await User.updateOne(
        { _id: user._id },
        { $set: { isProfileComplete: isComplete } }
      );
      updatedCount++;
    }
  }

  console.log(`  ✓ Updated profile completeness for ${updatedCount} users`);
  console.log('  ✅ Profile completeness calculation completed');
}

export async function down(db, mongoose) {
  console.log('  Reverting profile completeness...');
  // Set all profiles to incomplete
  const User = mongoose.model('User');
  await User.updateMany({}, { $set: { isProfileComplete: false } });
  console.log('  ✅ All profiles marked as incomplete');
}

