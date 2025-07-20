const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
  try {
    // Clear existing admin user
    await User.deleteMany({ email: 'admin@example.com' });

    // Create a new admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin', // Password will be hashed by the pre-save hook in the User model
      role: 'admin',
    });

    await adminUser.save();

    console.log('Admin user created successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
