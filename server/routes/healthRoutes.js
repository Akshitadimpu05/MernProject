const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// @route   GET /api/health
// @desc    Health check endpoint for Render
// @access  Public
router.get('/', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    mongoConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
  
  try {
    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.message = error;
    res.status(503).json(healthcheck);
  }
});

// @route   GET /api/health/compiler
// @desc    Check if compilers are installed and working
// @access  Public
router.get('/compiler', async (req, res) => {
  try {
    // Create temp directories if they don't exist
    const tempDir = path.join(__dirname, '..', 'temp');
    const outputDir = path.join(__dirname, '..', 'outputs');
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Check permissions
    fs.accessSync(tempDir, fs.constants.R_OK | fs.constants.W_OK);
    fs.accessSync(outputDir, fs.constants.R_OK | fs.constants.W_OK);
    
    // Check C++ compiler
    const cppCheck = await new Promise((resolve) => {
      exec('g++ --version', (error) => {
        resolve(!error);
      });
    });
    
    // Check Python
    const pythonCheck = await new Promise((resolve) => {
      exec('python3 --version', (error) => {
        resolve(!error);
      });
    });
    
    // Check Java
    const javaCheck = await new Promise((resolve) => {
      exec('java -version', (error) => {
        resolve(!error);
      });
    });
    
    res.status(200).json({
      compilers: {
        cpp: cppCheck ? 'installed' : 'missing',
        python: pythonCheck ? 'installed' : 'missing',
        java: javaCheck ? 'installed' : 'missing'
      },
      directories: {
        temp: fs.existsSync(tempDir) ? 'exists' : 'missing',
        output: fs.existsSync(outputDir) ? 'exists' : 'missing'
      }
    });
  } catch (error) {
    console.error('Compiler health check error:', error);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack
    });
  }
});

module.exports = router;
