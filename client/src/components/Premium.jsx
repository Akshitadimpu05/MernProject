// src/components/Premium.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser, updatePremiumStatus } from '../redux/slices/userSlice';

function Premium() {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated } = useSelector(state => state.user);
  
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Card payment form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  // Only card payment is supported

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(getCurrentUser());
    }
  }, [isAuthenticated, user, dispatch]);

  // Check if user is already premium
  useEffect(() => {
    if (user && user.isPremium) {
      setPaymentSuccess(true);
    }
  }, [user]);

  // No PayPal integration - removed due to Content Security Policy issues
  
  // Handle card payment submission
  const handleCardPayment = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Basic validation
    if (!cardNumber || !expiryDate || !cvv) {
      setError('Please fill in all required card fields');
      setLoading(false);
      return;
    }
    
    // In a real app, you would send this to your payment processor
    // For this demo, we'll simulate a successful payment
    setTimeout(() => {
      console.log('Processing card payment...');
      
      // Call your backend to update premium status
      dispatch(updatePremiumStatus({
        orderID: 'CARD-' + Date.now() // Generate a fake order ID
      }));
      
      // Show success message
      setPaymentSuccess(true);
      setLoading(false);
      
      // Refresh user data
      dispatch(getCurrentUser());
    }, 1500);
  };
  
  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  // Format expiry date (MM/YY)
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '');
    }
    
    return v;
  };
  
  // Payment error handling is now only for card payments

  return (
    <div className="min-h-screen bg-[#121212] py-12 px-4">
      <div className="max-w-4xl mx-auto bg-[#1E1E1E] rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#ff16ac] to-[#F06292] p-8 text-white">
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
              <h2 className="text-2xl font-bold text-[#ff16ac] mb-2">You're a Premium Member!</h2>
              <p className="text-[#B0B0B0] mb-6">
                {user?.premiumExpiresAt ? (
                  <>Your premium access is valid until {new Date(user.premiumExpiresAt).toLocaleDateString()}.</>
                ) : (
                  <>Enjoy unlimited access to all premium features.</>
                )}
              </p>
              <div className="flex justify-center space-x-4">
                <a href="/problems" className="px-6 py-2 bg-[#ff16ac] text-white rounded-md hover:bg-[#F06292] transition-colors">
                  Explore Premium Problems
                </a>
                <a href="/resources" className="px-6 py-2 border border-[#ff16ac] text-[#ff16ac] rounded-md hover:bg-[#ff16ac] hover:bg-opacity-10 transition-colors">
                  View Resources
                </a>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-[#121212] p-6 rounded-lg mb-8 border border-[#ff16ac] border-opacity-30">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-[#ff16ac] mb-2">Premium Plan</h2>
                    <p className="text-3xl font-bold text-white mb-4">₹999<span className="text-sm font-normal text-[#B0B0B0]">/month</span></p>
                  </div>
                  <div className="bg-[#ff16ac] text-white px-3 py-1 rounded-full text-sm font-medium">
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
                
                <div className="w-full">
                  {/* Card Payment Form */}
                    <form onSubmit={handleCardPayment} className="space-y-4">
                      <div>
                        <label htmlFor="cardName" className="block text-[#B0B0B0] mb-1 text-sm">Name on Card</label>
                        <input
                          type="text"
                          id="cardName"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="w-full px-3 py-2 bg-[#121212] border border-[#ff16ac] border-opacity-30 rounded-md text-white focus:outline-none focus:border-[#ff16ac]"
                          placeholder="John Doe"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="cardNumber" className="block text-[#B0B0B0] mb-1 text-sm">Card Number</label>
                        <input
                          type="text"
                          id="cardNumber"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          className="w-full px-3 py-2 bg-[#121212] border border-[#ff16ac] border-opacity-30 rounded-md text-white focus:outline-none focus:border-[#ff16ac]"
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                        />
                      </div>
                      
                      <div className="flex space-x-4">
                        <div className="flex-1">
                          <label htmlFor="expiryDate" className="block text-[#B0B0B0] mb-1 text-sm">Expiry Date</label>
                          <input
                            type="text"
                            id="expiryDate"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                            className="w-full px-3 py-2 bg-[#121212] border border-[#ff16ac] border-opacity-30 rounded-md text-white focus:outline-none focus:border-[#ff16ac]"
                            placeholder="MM/YY"
                            maxLength="5"
                          />
                        </div>
                        <div className="flex-1">
                          <label htmlFor="cvv" className="block text-[#B0B0B0] mb-1 text-sm">CVV</label>
                          <input
                            type="text"
                            id="cvv"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                            className="w-full px-3 py-2 bg-[#121212] border border-[#ff16ac] border-opacity-30 rounded-md text-white focus:outline-none focus:border-[#ff16ac]"
                            placeholder="123"
                            maxLength="3"
                          />
                        </div>
                      </div>
                      
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[#ff16ac] text-white rounded-md hover:bg-[#F06292] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Processing...' : 'Pay ₹999'}
                      </button>
                    </form>
                </div>
                
                {error && (
                  <div className="mt-4 p-3 bg-[#FF5252] bg-opacity-20 border border-[#FF5252] text-[#FF5252] rounded">
                    {error}
                  </div>
                )}
              </div>
              
              <div className="text-center text-[#B0B0B0]">
                <p>Secure payment powered by PayPal</p>
                <p className="mt-2">Questions? Contact us at support@cavelix.com</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Premium;