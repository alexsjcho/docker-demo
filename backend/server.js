const express = require('express');
const { createClient } = require('redis');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 4000;
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';

// Rate limiting middleware: 30 requests per minute
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per window
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: { error: 'Too many requests, please try again later.' }
});

// Create Redis client
const redisClient = createClient({
  url: REDIS_URL
});

// Handle Redis connection events
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis Client: Connecting...');
});

redisClient.on('ready', () => {
  console.log('✅ Redis Client: Connected and ready!');
});

// Connect to Redis
redisClient.connect().catch((err) => {
  console.error('❌ Failed to connect to Redis:', err);
  process.exit(1);
});

// Middleware
app.use(express.json());
app.use(limiter); // Apply rate limiting to all routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Main API endpoint - increments counter in Redis
app.get('/api', async (req, res) => {
  try {
    // Increment the counter in Redis
    const count = await redisClient.incr('api:count');
    
    res.json({
      message: 'Hello from Node backend 👋',
      count: count
    });
  } catch (error) {
    console.error('Error in /api endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});

