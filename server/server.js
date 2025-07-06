const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/algo-web-app';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000 // Timeout after 5 seconds
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Import routes
const authRoutes = require('./routes/authRoutes');
const codeRoutes = require('./routes/codeRoutes');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create temp and output directories if they don't exist
const fs = require('fs');
const tempDir = path.join(__dirname, 'temp');
const outputDir = path.join(__dirname, 'outputs');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Auth middleware - MODIFIED to be more permissive for testing
app.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  // If there's a token, use it to set the user
  if (token) {
    // For testing purposes, use a dummy ObjectId
    try {
      req.user = { _id: new ObjectId(token) };
    } catch (error) {
      // If token is not a valid ObjectId, use a dummy one
      req.user = { _id: new ObjectId("64a1b6c8f8c42a1b8bc0ef12") };
    }
  } else {
    // For testing - allow requests without authentication
    // In production, you would want to protect certain routes
    req.user = { _id: new ObjectId("64a1b6c8f8c42a1b8bc0ef12") }; // Dummy user ID
  }
  
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use("/api/code", codeRoutes);

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

module.exports = app; // Export for testing