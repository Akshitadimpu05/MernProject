const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const codeRoutes = require('./routes/codeRoutes');

// MongoDB connection - using your existing .env config
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/algo-web-app';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create temp and output directories
const tempDir = path.join(__dirname, 'temp');
const outputDir = path.join(__dirname, 'outputs');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Authentication middleware
app.use((req, res, next) => {
  // Skip auth for login and register routes
  if (req.path === '/api/auth/login' || 
      req.path === '/api/auth/register' || 
      req.path === '/health') {
    return next();
  }
  
  // Get token from header
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Add user from payload to request
    req.user = { _id: decoded.user.id };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/code', codeRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;