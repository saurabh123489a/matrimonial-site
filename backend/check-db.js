import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/matrimonial';
    
    console.log('🔍 Checking database connection...');
    console.log('📍 MongoDB URI:', mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')); // Hide password
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ Database connection successful!');
    console.log('📊 Database name:', mongoose.connection.name);
    console.log('🏠 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);
    console.log('📈 Connection state:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');
    
    // Test a simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections found:', collections.length);
    if (collections.length > 0) {
      console.log('   Collections:', collections.map(c => c.name).join(', '));
    }
    
    await mongoose.disconnect();
    console.log('✅ Database check completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error:', error.message);
    console.error('\n💡 Suggestions:');
    console.error('   1. Make sure MongoDB is running (if local: docker-compose up -d mongodb)');
    console.error('   2. Check your MONGODB_URI in .env file');
    console.error('   3. For MongoDB Atlas: Check your connection string and IP whitelist');
    console.error('   4. For local MongoDB: Ensure it\'s running on the specified port');
    process.exit(1);
  }
}

checkDatabase();

