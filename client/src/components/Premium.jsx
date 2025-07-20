// src/components/Premium.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser, updatePremiumStatus } from '../redux/slices/userSlice';

function Premium() {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated } = useSelector(state => state.user);
  
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(getCurrentUser());
    }
  }, [isAuthenticated, user, dispatch]);

  // Check if user is already premium
  useEffect(() => {
    if (user && user.isPremium) {
      // Format the expiry date
      const expiryDate = new Date(user.premiumExpiresAt);
      const formattedDate = expiryDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      setPaymentSuccess(true);
    }
  }, [user]);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Create order
      const response = await fetch('/api/premium/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount: 999 }) // ₹999 for premium
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }
      
      setOrderDetails(data.order);
      
      // Initialize Razorpay
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_yourkeyhere',
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'AlgoWebApp',
        description: 'Premium Subscription',
        order_id: data.order.id,
        handler: async function (response) {
          try {
            // Use Redux thunk to verify payment and update premium status
            const resultAction = await dispatch(updatePremiumStatus({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            }));
            
            if (updatePremiumStatus.fulfilled.match(resultAction)) {
              // Payment verification successful
              setPaymentSuccess(true);
            } else {
              // Payment verification failed
              throw new Error(resultAction.payload || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setError(error.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: user?.username || '',
          email: user?.email || ''
        },
        theme: {
          color: '#FF4081'
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Subscription error:', error);
      setError(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] py-12 px-4">
      <div className="max-w-4xl mx-auto bg-[#1E1E1E] rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FF4081] to-[#F06292] p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Unlock Premium Features</h1>
          <p className="text-lg opacity-90">Take your coding skills to the next level</p>
        </div>
        
        {/* Content */}
        <div className="p-8">
          {paymentSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#4CAF50] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#FF4081] mb-2">You're a Premium Member!</h2>
              <p className="text-[#B0B0B0] mb-6">
                {user?.premiumExpiresAt ? (
                  <>Your premium access is valid until {new Date(user.premiumExpiresAt).toLocaleDateString()}.</>
                ) : (
                  <>Enjoy unlimited access to all premium features.</>
                )}
              </p>
              <div className="flex justify-center space-x-4">
                <a href="/problems" className="px-6 py-2 bg-[#FF4081] text-white rounded-md hover:bg-[#F06292] transition-colors">
                  Explore Premium Problems
                </a>
                <a href="/resources" className="px-6 py-2 border border-[#FF4081] text-[#FF4081] rounded-md hover:bg-[#FF4081] hover:bg-opacity-10 transition-colors">
                  View Resources
                </a>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-[#121212] p-6 rounded-lg mb-8 border border-[#FF4081] border-opacity-30">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-[#FF4081] mb-2">Premium Plan</h2>
                    <p className="text-3xl font-bold text-white mb-4">₹999<span className="text-sm font-normal text-[#B0B0B0]">/month</span></p>
                  </div>
                  <div className="bg-[#FF4081] text-white px-3 py-1 rounded-full text-sm font-medium">
                    Recommended
                  </div>
                </div>
                
                <ul className="space-y-3 my-6 text-[#FFFFFF]">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#4CAF50]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Access to all premium problems
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#4CAF50]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Exclusive learning resources
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#4CAF50]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Advanced code analysis
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#4CAF50]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Interview preparation guides
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#4CAF50]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Priority support
                  </li>
                </ul>
                
                <button 
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="w-full py-3 bg-[#FF4081] text-white rounded-md font-semibold hover:bg-[#F06292] transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Subscribe Now'
                  )}
                </button>
                
                {error && (
                  <div className="mt-4 p-3 bg-[#FF5252] bg-opacity-20 border border-[#FF5252] text-[#FF5252] rounded">
                    {error}
                  </div>
                )}
              </div>
              
              <div className="text-center text-[#B0B0B0]">
                <p>Secure payment powered by Razorpay</p>
                <p className="mt-2">Questions? Contact us at support@algowebapp.com</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Premium;