import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir } from 'fs/promises';
import dotenv from 'dotenv';

// Import all models so they're registered with mongoose
import '../models/User.js';
import '../models/Interest.js';
import '../models/Shortlist.js';
import '../models/Question.js';
import '../models/Answer.js';
import '../models/Vote.js';
import '../models/OTP.js';
import '../models/ProfileView.js';
import '../models/Notification.js';
import '../models/Message.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Migration collection schema
const migrationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  timestamp: { type: Date, default: Date.now },
});

const Migration = mongoose.model('Migration', migrationSchema);

/**
 * Run all pending migrations
 */
export async function runMigrations() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB for migrations');

    // Get all migration files
    const migrationsDir = join(__dirname);
    const files = await readdir(migrationsDir);
    const migrationFiles = files
      .filter(file => file.endsWith('.migration.js') && file !== 'migrate.js')
      .sort();

    if (migrationFiles.length === 0) {
      console.log('📋 No migrations found');
      return;
    }

    console.log(`📋 Found ${migrationFiles.length} migration(s)`);

    // Get already executed migrations
    const executedMigrations = await Migration.find({}).lean();
    const executedNames = new Set(executedMigrations.map(m => m.name));

    let executedCount = 0;

    for (const file of migrationFiles) {
      const migrationName = file.replace('.migration.js', '');
      
      if (executedNames.has(migrationName)) {
        console.log(`⏭️  Skipping ${migrationName} (already executed)`);
        continue;
      }

      console.log(`🔄 Running migration: ${migrationName}`);

      try {
        // Import and run the migration
        const migrationPath = join(migrationsDir, file);
        const migrationModule = await import(`file://${migrationPath}`);
        
        if (typeof migrationModule.up !== 'function') {
          throw new Error(`Migration ${migrationName} must export an 'up' function`);
        }

        // Run the migration
        await migrationModule.up(mongoose.connection.db, mongoose);

        // Record the migration
        await Migration.create({ name: migrationName });
        console.log(`✅ Completed: ${migrationName}`);
        executedCount++;

      } catch (error) {
        console.error(`❌ Failed to run migration ${migrationName}:`, error.message);
        
        // Try to rollback if down function exists
        try {
          const migrationPath = join(migrationsDir, file);
          const migrationModule = await import(`file://${migrationPath}`);
          if (typeof migrationModule.down === 'function') {
            await migrationModule.down(mongoose.connection.db, mongoose);
            console.log(`↩️  Rolled back: ${migrationName}`);
          }
        } catch (rollbackError) {
          console.error(`❌ Rollback failed for ${migrationName}:`, rollbackError.message);
        }

        throw error; // Stop on first failure
      }
    }

    if (executedCount === 0) {
      console.log('✅ All migrations are up to date');
    } else {
      console.log(`✅ Successfully executed ${executedCount} migration(s)`);
    }

  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Migration connection closed');
  }
}

/**
 * Rollback the last migration
 */
export async function rollbackLast() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB for rollback');

    // Get the last executed migration
    const lastMigration = await Migration.findOne({}).sort({ timestamp: -1 });

    if (!lastMigration) {
      console.log('📋 No migrations to rollback');
      return;
    }

    console.log(`🔄 Rolling back: ${lastMigration.name}`);

    // Find and run the down migration
    const migrationsDir = join(__dirname);
    const migrationFile = `${lastMigration.name}.migration.js`;
    const migrationPath = join(migrationsDir, migrationFile);

    try {
      const migrationModule = await import(`file://${migrationPath}`);
      
      if (typeof migrationModule.down !== 'function') {
        throw new Error(`Migration ${lastMigration.name} does not have a 'down' function`);
      }

      await migrationModule.down(mongoose.connection.db, mongoose);
      await Migration.deleteOne({ _id: lastMigration._id });
      console.log(`✅ Successfully rolled back: ${lastMigration.name}`);

    } catch (error) {
      console.error(`❌ Rollback failed:`, error.message);
      throw error;
    }

  } catch (error) {
    console.error('❌ Rollback error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Rollback connection closed');
  }
}

// Run migrations if called directly
const command = process.argv[2] || 'up';

if (command === 'up') {
  runMigrations().catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
} else if (command === 'down') {
  rollbackLast().catch(error => {
    console.error('Rollback failed:', error);
    process.exit(1);
  });
} else {
  console.error('Usage: node migrate.js [up|down]');
  process.exit(1);
}

