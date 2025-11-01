# Database Migrations Guide

This project uses a custom migration system to manage database schema changes and data updates.

## Overview

Migrations are stored in `src/migrations/` and follow a naming pattern: `{number}_{description}.migration.js`

Each migration file must export two functions:
- `up(db, mongoose)`: Runs the migration
- `down(db, mongoose)`: Rolls back the migration (optional but recommended)

## Available Migrations

### 001_create_indexes.migration.js
Creates optimized database indexes for:
- User queries (email, phone, gender, age, location, religion)
- Interest queries (fromUser, toUser, status)
- Shortlist queries (userId, shortlistedUserId)
- Question queries (author, category, tags, votes)
- Answer queries (question, author, votes)
- Vote queries (user, targetType, targetId)

### 002_set_default_values.migration.js
Sets default values for existing documents:
- Default country: 'India' for users without country
- Default isActive: true
- Default isProfileComplete: false
- Default interest status: 'pending'

### 003_add_profile_completeness.migration.js
Recalculates profile completeness for all users based on:
- Required fields (name, gender, dateOfBirth, city, country, religion, education, occupation, bio)
- At least one photo requirement

## Running Migrations

### Run all pending migrations
```bash
npm run migrate
```

### Rollback the last migration
```bash
npm run migrate:rollback
```

### Run migrations manually
```bash
node src/migrations/migrate.js up
node src/migrations/migrate.js down
```

## Creating New Migrations

1. Create a new file: `src/migrations/{number}_{description}.migration.js`
2. Follow the naming convention (sequential numbers)
3. Export `up` and `down` functions:

```javascript
export async function up(db, mongoose) {
  // Your migration code here
  // Access models via mongoose.model('ModelName')
  const User = mongoose.model('User');
  await User.collection.createIndex({ field: 1 });
}

export async function down(db, mongoose) {
  // Your rollback code here
  const User = mongoose.model('User');
  await User.collection.dropIndex({ field: 1 });
}
```

## Migration Tracking

The system automatically tracks executed migrations in a `migrations` collection in your MongoDB database. This prevents running the same migration twice.

## Best Practices

1. **Always test migrations** in a development environment first
2. **Backup your database** before running migrations in production
3. **Write idempotent migrations** - they should be safe to run multiple times
4. **Include rollback logic** in the `down` function
5. **Use transactions** for data migrations when possible
6. **Keep migrations small** and focused on a single change

## Troubleshooting

### Migration fails
- Check MongoDB connection in `.env`
- Ensure all required models are imported in `migrate.js`
- Check migration logs for specific error messages

### Migration already executed
- The system tracks executed migrations automatically
- To re-run a migration, remove its entry from the `migrations` collection:
  ```javascript
  db.migrations.deleteOne({ name: "001_create_indexes" })
  ```

### Rollback fails
- Some migrations (like index creation) may not have perfect rollbacks
- Check the migration's `down` function for rollback logic

## Migration Status

Check which migrations have been executed:
```javascript
// In MongoDB shell or MongoDB Compass
db.migrations.find().sort({ timestamp: -1 })
```

