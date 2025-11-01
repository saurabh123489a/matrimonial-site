import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { connectToDatabase } from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import router from './routes/index.js';

const app = express();

// CORS must be before other middleware
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // Allow all origins if wildcard is specified
    if (allowedOrigins.includes('*')) {
      callback(null, true);
      return;
    }
    
    // Check exact match
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    
    // Check wildcard patterns (e.g., https://*.vercel.app)
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = allowed.replace(/\*/g, '[^.]*');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
  preflightContinue: false,
};

// Apply CORS before other middleware
app.use(cors(corsOptions));

// Configure Helmet to not interfere with CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve uploaded photos
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use('/uploads/photos', express.static(join(__dirname, '../uploads/photos')));

// Logging
app.use(morgan('dev'));

// API routes
app.use('/api', router);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: true,
    message: 'Matrimonial API',
    version: '1.0.0'
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Server startup
const PORT = process.env.PORT || 5050;

// Connect to database and start server
connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 API available at http://localhost:${PORT}/api`);
    });
  })
  .catch((error) => {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  });

export default app;

