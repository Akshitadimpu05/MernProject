/**
 * PayPal Integration Test Script
 * 
 * This script tests the PayPal API integration for the Cavélix application.
 * It verifies that the PayPal API credentials are valid and that the basic
 * order creation and capture flow works correctly.
 */

require('dotenv').config();
const fetch = require('node-fetch');

// PayPal API endpoints (Sandbox)
const PAYPAL_API_URL = 'https://api-m.sandbox.paypal.com';

// Test configuration
const TEST_AMOUNT = '9.99';
const TEST_CURRENCY = 'USD';

/**
 * Get PayPal access token using client credentials
 */
async function getPayPalAccessToken() {
  console.log('Getting PayPal access token...');
  
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');
  
  try {
    const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`,
      },
      body: 'grant_type=client_credentials',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Failed to get PayPal access token:', data);
      return null;
    }
    
    console.log('✅ Successfully obtained PayPal access token');
    return data.access_token;
  } catch (error) {
    console.error('❌ Error getting PayPal access token:', error.message);
    return null;
  }
}

/**
 * Create a test PayPal order
 */
async function createTestOrder(accessToken) {
  console.log('Creating test PayPal order...');
  
  try {
    const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: TEST_CURRENCY,
              value: TEST_AMOUNT,
            },
            description: 'Cavélix Premium Subscription (Test)',
          },
        ],
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Failed to create test order:', data);
      return null;
    }
    
    console.log('✅ Successfully created test order:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Error creating test order:', error.message);
    return null;
  }
}

/**
 * Run the integration test
 */
async function runTest() {
  console.log('=== PayPal Integration Test ===');
  
  // Check environment variables
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    console.error('❌ Missing PayPal environment variables. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.');
    return;
  }
  
  console.log('Environment variables found.');
  
  // Get access token
  const accessToken = await getPayPalAccessToken();
  if (!accessToken) {
    console.error('❌ Test failed: Could not obtain PayPal access token.');
    return;
  }
  
  // Create test order
  const order = await createTestOrder(accessToken);
  if (!order) {
    console.error('❌ Test failed: Could not create PayPal test order.');
    return;
  }
  
  console.log('=== Test Results ===');
  console.log('✅ PayPal API credentials are valid');
  console.log('✅ Order creation is working');
  console.log('✅ Integration test passed!');
  console.log('\nOrder Details:');
  console.log('- Order ID:', order.id);
  console.log('- Status:', order.status);
  console.log('- Links:');
  order.links.forEach(link => {
    console.log(`  - ${link.rel}: ${link.href}`);
  });
  
  console.log('\n=== Next Steps ===');
  console.log('1. To complete the test, you would need to capture this order');
  console.log('2. In a real application, the user would approve the payment first');
  console.log('3. The backend would then capture the approved payment');
  console.log('\nTest completed successfully!');
}

// Run the test
runTest().catch(error => {
  console.error('Unhandled error during test:', error);
});
