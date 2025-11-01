import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

/**
 * Simple Health Check
 * GET /api/health
 */
router.get('/', (req, res) => {
  res.json({
    status: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * Database Health Check
 * GET /api/health/db
 */
router.get('/db', async (req, res) => {
  try {
    const connectionState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    const stateName = states[connectionState] || 'unknown';
    const isConnected = connectionState === 1;

    // Try to get collection count if connected
    let collectionCount = 0;
    let collections = [];
    if (isConnected) {
      try {
        collections = await mongoose.connection.db.listCollections().toArray();
        collectionCount = collections.length;
      } catch (err) {
        // Ignore error
      }
    }

    res.json({
      status: isConnected,
      message: isConnected ? '✅ Database is connected' : `⚠️ Database is ${stateName}`,
      connectionState: stateName,
      stateCode: connectionState,
      database: mongoose.connection.name || 'Not connected',
      host: mongoose.connection.host || 'N/A',
      port: mongoose.connection.port || 'N/A',
      collections: collectionCount,
      collectionNames: collections.map(c => c.name),
      mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error checking database status',
      error: error.message,
      connectionState: 'error',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;

