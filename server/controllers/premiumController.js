const User = require('../models/User');
const fetch = require('node-fetch');
const crypto = require('crypto');

// PayPal configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API = process.env.NODE_ENV === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

// Check if PayPal credentials are configured
const isPayPalConfigured = PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET;

// Generate PayPal access token
const generateAccessToken = async () => {
  try {
    // Check if PayPal credentials are configured
    if (!isPayPalConfigured) {
      console.warn('PayPal credentials are not configured. Using test mode.');
      // Return a fake token for test mode
      return 'TEST_TOKEN';
    }
    
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: 'POST',
      body: 'grant_type=client_credentials',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Failed to generate PayPal access token:', error);
    // Return a fake token for test mode
    console.warn('Using test mode due to error.');
    return 'TEST_TOKEN';
  }
};

// Create a new order for premium subscription
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    
    // For development, always use test mode
    console.log('Using test mode for development - creating mock PayPal order');
    
    // Generate a unique test order ID
    const testOrderId = `TEST-${Date.now()}`;
    
    // Return a mock order for testing purposes
    return res.status(200).json({
      success: true,
      order: {
        id: testOrderId,
        status: 'CREATED',
        links: [
          {
            href: `https://www.sandbox.paypal.com/checkoutnow?token=${testOrderId}`,
            rel: 'approve',
            method: 'GET'
          }
        ]
      }
    });
    
    /* Real PayPal integration code - commented out for now
    // Get PayPal access token
    const accessToken = await generateAccessToken();
    
    // Create a new PayPal order
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: (amount / 75).toFixed(2) // Convert INR to USD (approximate)
            },
            description: 'Cavélix Premium Subscription'
          }
        ],
        application_context: {
          brand_name: 'Cavélix',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/premium-success`,
          cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/premium-cancel`
        }
      })
    });
    
    const order = await response.json();
    
    if (order.error) {
      console.error('PayPal API error:', order.error);
      throw new Error(order.error.message || 'Error creating PayPal order');
    }
    
    return res.status(200).json({
      success: true,
      order
    });
    */
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong',
      error: error.message
    });
  }
};

// Capture PayPal payment
exports.verifyPayment = async (req, res) => {
  try {
    const { orderID } = req.body; // Match the parameter name used in frontend
    
    console.log('Verifying payment for order:', orderID);
    
    // For development, always use test mode
    console.log('Using test mode for development - auto-approving payment');
    
    // Find the user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update user to premium
    const premiumExpiresAt = new Date();
    premiumExpiresAt.setFullYear(premiumExpiresAt.getFullYear() + 1); // 1 year subscription
    
    user.isPremium = true;
    user.premiumExpiresAt = premiumExpiresAt;
    await user.save();
    
    console.log(`User ${user.username} upgraded to premium successfully`);
    
    return res.status(200).json({
      success: true,
      message: 'Payment successful! You are now a premium user.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isPremium: user.isPremium,
        premiumExpiresAt: user.premiumExpiresAt
      }
    });
    
    /* Real PayPal integration code - commented out for now
    const accessToken = await generateAccessToken();
    
    // Capture the order to complete payment
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error('PayPal capture error:', data.error);
      throw new Error(data.error.message || 'Error capturing PayPal payment');
    }
    
    // Update user to premium
    const userFromPayPal = await User.findById(req.user.id);
    if (!userFromPayPal) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Set premium status and expiry date
    userFromPayPal.isPremium = true;
    userFromPayPal.premiumExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    userFromPayPal.paypalTransactionId = data.purchase_units[0].payments.captures[0].id;
    
    await userFromPayPal.save();
    
    return res.status(200).json({
      success: true,
      message: 'Payment successful! You are now a premium user.',
      user: {
        id: userFromPayPal._id,
        username: userFromPayPal.username,
        email: userFromPayPal.email,
        isPremium: userFromPayPal.isPremium,
        premiumExpiresAt: userFromPayPal.premiumExpiresAt
      }
    });
    */
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong',
      error: error.message
    });
  }
};

// Get premium status
exports.getPremiumStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if premium has expired
    if (user.isPremium && user.premiumExpiresAt && new Date(user.premiumExpiresAt) < new Date()) {
      user.isPremium = false;
      user.premiumExpiresAt = null;
      await user.save();
    }
    
    res.status(200).json({
      success: true,
      isPremium: user.isPremium,
      premiumExpiresAt: user.isPremium ? user.premiumExpiresAt : null
    });
  } catch (error) {
    console.error('Get premium status error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong',
      error: error.message
    });
  }
};
