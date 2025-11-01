/**
 * Migration: Set default values for existing documents
 * This migration updates existing documents with default values where needed
 */

export async function up(db, mongoose) {
  console.log('  Setting default values...');

  const User = mongoose.model('User');
  const Interest = mongoose.model('Interest');
  const Shortlist = mongoose.model('Shortlist');

  // Update users without country to default 'India'
  const userResult = await User.updateMany(
    { country: { $exists: false } },
    { $set: { country: 'India' } }
  );
  console.log(`  ✓ Updated ${userResult.modifiedCount} users with default country`);

  // Ensure all users have isActive and isProfileComplete flags
  const activeResult = await User.updateMany(
    { isActive: { $exists: false } },
    { $set: { isActive: true } }
  );
  console.log(`  ✓ Updated ${activeResult.modifiedCount} users with isActive flag`);

  const profileResult = await User.updateMany(
    { isProfileComplete: { $exists: false } },
    { $set: { isProfileComplete: false } }
  );
  console.log(`  ✓ Updated ${profileResult.modifiedCount} users with isProfileComplete flag`);

  // Set default status for interests if missing
  const interestResult = await Interest.updateMany(
    { status: { $exists: false } },
    { $set: { status: 'pending' } }
  );
  console.log(`  ✓ Updated ${interestResult.modifiedCount} interests with default status`);

  console.log('  ✅ Default values set successfully');
}

export async function down(db, mongoose) {
  console.log('  Reverting default values...');
  // This migration is mostly additive, so rollback isn't critical
  // But we can remove the defaults if needed
  console.log('  ⚠️  Rollback skipped (non-destructive migration)');
}

