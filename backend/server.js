import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'dns';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.js';
import vehicleRoutes from './routes/vehicles.js';
import driverRoutes from './routes/drivers.js';
import tripRoutes from './routes/trips.js';
import maintenanceRoutes from './routes/maintenance.js';
import expenseRoutes from './routes/expenses.js';
import analyticsRoutes from './routes/analytics.js';

dns.setServers(['1.1.1.1', '8.8.8.8']);
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Production Hardening Middleware
app.use(helmet()); // Secure HTTP headers
app.use(compression()); // Compress responses
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev')); // Logging

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply rate limiter to auth routes
app.use('/api/auth', limiter);

// SECURITY: Strict CORS configuration with allowlist
const allowedOrigins = (process.env.FRONTEND_URL || '').split(',').map(s => s.trim()).filter(Boolean);

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.length === 0) {
        // Fail-closed: no origins configured
        return callback(new Error('CORS: No allowed origins configured'));
      }
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS: Origin not allowed'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Attach io to app to use in controllers
app.set('io', io);

// Middleware - Strict CORS with credentials
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.length === 0) {
      // Fail-closed: no origins configured
      return callback(new Error('CORS: No allowed origins configured'));
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS: Origin not allowed'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to Database
connectDB();

// SECURITY: Socket.io authentication middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    
    if (!token) {
      return next(new Error('Authentication required'));
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (error) {
    next(new Error('Invalid or expired token'));
  }
});

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log('🔌 Authenticated client connected:', socket.id, 'User:', socket.user.userId);

  socket.on('join_trip', async (tripId) => {
    // TODO: Add authorization check - verify user has access to this trip
    // For now, authenticated users can join any trip
    // In production, check if user owns/is assigned to this trip
    socket.join(`trip_${tripId}`);
    console.log(`📡 Client ${socket.id} (User: ${socket.user.userId}) joined trip tracking: ${tripId}`);
  });

  socket.on('leave_trip', (tripId) => {
    socket.leave(`trip_${tripId}`);
    console.log(`📴 Client ${socket.id} left trip tracking: ${tripId}`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health Check
app.get('/health', (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    database: dbStates[mongoose.connection.readyState] || 'unknown',
    node_env: process.env.NODE_ENV,
  });
});

// SECURITY: Debug endpoint removed in production to prevent information disclosure
// If needed for diagnostics, protect with admin authentication and IP restrictions
if (process.env.NODE_ENV === 'development') {
  app.get('/debug', (req, res) => {
    const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.status(200).json({
      hasMongoURI: !!process.env.MONGODB_URI,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasFrontendUrl: !!process.env.FRONTEND_URL,
      nodeEnv: process.env.NODE_ENV,
      dbReadyState: dbStates[mongoose.connection.readyState] || 'unknown',
    });
  });
}

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
