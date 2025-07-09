// src/components/Premium.jsx
import React from 'react';

function Premium() {
  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-[#3B1C32] mb-6">Premium Features</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#3B1C32] to-[#6A1E55] p-6 rounded-lg text-white">
          <h2 className="text-xl font-bold mb-4">Basic Plan</h2>
          <p className="text-3xl font-bold mb-4">$9.99<span className="text-sm font-normal">/month</span></p>
          <ul className="space-y-2">
            <li>✓ Access to all basic problems</li>
            <li>✓ Community forum access</li>
            <li>✓ Basic analytics</li>
          </ul>
          <button className="mt-6 w-full py-2 bg-white text-[#6A1E55] rounded-md font-semibold hover:bg-gray-100 transition-colors">
            Get Started
          </button>
        </div>
        
        <div className="bg-gradient-to-br from-[#6A1E55] to-[#A64D79] p-6 rounded-lg text-white">
          <h2 className="text-xl font-bold mb-4">Pro Plan</h2>
          <p className="text-3xl font-bold mb-4">$19.99<span className="text-sm font-normal">/month</span></p>
          <ul className="space-y-2">
            <li>✓ Access to all premium problems</li>
            <li>✓ Advanced analytics</li>
            <li>✓ Interview preparation resources</li>
            <li>✓ Premium support</li>
            <li>✓ No advertisements</li>
          </ul>
          <button className="mt-6 w-full py-2 bg-white text-[#A64D79] rounded-md font-semibold hover:bg-gray-100 transition-colors">
            Upgrade Now
          </button>
        </div>
      </div>
      
      <div className="mt-10 text-center text-gray-700">
        <p>Questions about our premium plans? Contact us at premium@cavelix.com</p>
      </div>
    </div>
  );
}

export default Premium;