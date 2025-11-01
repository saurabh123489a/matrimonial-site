import mongoose from 'mongoose';

/**
 * MongoDB connection configuration
 * Supports both local MongoDB and MongoDB Atlas
 */
export const connectToDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/matrimonial';
    
    if (!process.env.MONGODB_URI) {
      console.warn('⚠️  MONGODB_URI not set in environment, using default: mongodb://localhost:27017/matrimonial');
    }

    // Connection options optimized for MongoDB Atlas
    const options = {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout (reduced for faster failure detection)
      socketTimeoutMS: 30000, // 30 seconds socket timeout
      connectTimeoutMS: 10000, // 10 seconds connection timeout
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 2, // Maintain at least 2 socket connections
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      // Heartbeat frequency to detect connection issues faster
      heartbeatFrequencyMS: 10000,
    };

    // Connect to MongoDB
    await mongoose.connect(mongoUri, options);

    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🏠 Host:', mongoose.connection.host);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check if MongoDB is running');
    console.error('   2. Verify MONGODB_URI in .env file');
    console.error('   3. For Docker: Run "docker-compose up -d mongodb"');
    console.error('   4. Check network connectivity');
    throw error;
  }
};

/**
 * Get database connection status
 */
export const getDatabaseStatus = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  
  return {
    isConnected: state === 1,
    state: states[state] || 'unknown',
    stateCode: state,
    database: mongoose.connection.name,
    host: mongoose.connection.host,
  };
};
