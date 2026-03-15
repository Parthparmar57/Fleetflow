import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.error('❌ FATAL: MONGODB_URI environment variable is not set!');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ FATAL: MongoDB connection failed:', error.message);
    console.error('Check that your MONGODB_URI is correct and Atlas IP whitelist allows 0.0.0.0/0');
    process.exit(1); // Kill the server — no point running without DB
  }
};

// Handle connection events
mongoose.connection.on('error', (error) => {
  console.error('❌ Mongoose runtime error:', error.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  Mongoose disconnected from MongoDB');
});
