import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import { IoIosHelpCircleOutline } from 'react-icons/io';
// Import additional icons
import { FaCode, FaLaptopCode, FaUserAstronaut, FaRocket } from 'react-icons/fa';
import '../styles/home-animations.css';

gsap.registerPlugin(ScrollTrigger);

// Dummy ChatBot component (replace with real one if available)
const ChatBot = () => (
  <div className="bg-[#1E1E1E] text-white p-4 rounded-lg shadow-lg w-72 border-2 border-[#FF4081] slide-in custom-scrollbar">
    <p className="font-semibold text-[#FF4081]">Hi! I'm the Cavélix Assistant 🤖</p>
    <p className="text-sm mt-2">How can I help with your coding journey today?</p>
    <div className="mt-3 bg-[#2D2D2D] rounded p-2 text-xs">
      Try asking:
      <ul className="list-disc pl-4 mt-1 text-[#F06292]">
        <li>Recommend a problem for beginners</li>
        <li>Help with JavaScript algorithms</li>
        <li>How do I improve my coding skills?</li>
      </ul>
    </div>
  </div>
);

// Image URLs for the coding-related images
const codingImages = [
  "https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", // Code on screen
  "https://images.unsplash.com/photo-1516116216624-53e697fedbea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", // Person coding
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", // Code closeup
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"  // Laptop with code
];

function Home() {
  const navigate = useNavigate();
  const [showChatBot, setShowChatBot] = useState(false);
  const comp = useRef(null);
  const imageContainerRef = useRef(null);
  
  // Additional effects can be added here if needed
  useEffect(() => {
    // Any cleanup or initialization logic
    return () => {
      // Clean up if needed
    };
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.from('.hero-heading', {
        opacity: 0,
        y: 60,
        duration: 1.6,
        ease: 'power3.out',
      });
      
      gsap.fromTo(
        '.hero-sub-line',
        {
          opacity: 0,
          scaleX: 0,
          transformOrigin: 'left center',
        },
        {
          opacity: 1,
          scaleX: 1,
          duration: 1.8,
          delay: 0.5,
          ease: 'power2.out',
        }
      );
      
      // Floating animation for the hero image container
      gsap.to('.floating-container', {
        y: '-15px',
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });
      
      // Animation for the images appearing one by one
      gsap.utils.toArray('.coding-image').forEach((img, i) => {
        gsap.fromTo(
          img,
          { opacity: 0, scale: 0.8, rotate: -5 + (i * 3) },
          { 
            opacity: 1, 
            scale: 1, 
            rotate: 0,
            duration: 0.7, 
            delay: 0.3 + (i * 0.2),
            ease: 'back.out(1.7)'
          }
        );
      });
      
      // Feature cards animations
      gsap.utils.toArray('.feature-card').forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          y: 50,
          duration: 1,
          delay: i * 0.2,
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            end: 'bottom 10%',
            toggleActions: 'play none none reverse',
          },
        });
      });
      
      // CTA section animation
      gsap.from('#cta', {
        opacity: 0,
        y: 40,
        duration: 1,
        scrollTrigger: {
          trigger: '#cta',
          start: 'top 90%',
        },
      });
      
      // Tech stack section animation
      gsap.from('.tech-item', {
        opacity: 0,
        stagger: 0.1,
        y: 20,
        duration: 0.5,
        scrollTrigger: {
          trigger: '.tech-stack',
          start: 'top 80%',
        }
      });
      
    }, comp);
    
    return () => ctx.revert();
  }, []);
  
  return (
    <div ref={comp} className="bg-gradient-to-b from-[#1F1F1F] to-[#2E2E2E] min-h-screen text-white custom-scrollbar">
      <div className="container mx-auto px-4">
        {/* Hero Section with Images */}
        <div className="min-h-screen flex flex-col md:flex-row justify-center items-center py-16 relative">
          <div className="md:w-1/2 text-center md:text-left mb-12 md:mb-0 z-10">
            <h1 className="hero-heading text-5xl md:text-6xl font-extrabold tracking-tight mb-6 gradient-text">
              Welcome to Cavélix
            </h1>
            <div className="overflow-hidden">
              <p className="hero-sub-line text-xl md:text-2xl font-light italic tracking-wide max-w-2xl mx-auto md:mx-0 text-gray-200 mb-8">
                Your platform for solving coding challenges and improving your skills
              </p>
            </div>
            <button 
              onClick={() => navigate('/problems')}
              className="bg-[#FF4081] hover:bg-[#F06292] text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 btn-hover-effect"
            >
              Start Coding Now
            </button>
          </div>
          
          {/* Floating Images Container */}
          <div 
            ref={imageContainerRef} 
            className="floating-container md:w-1/2 relative h-80 md:h-96"
          >
            {codingImages.map((src, index) => (
              <div 
                key={index}
                className={`coding-image absolute rounded-lg overflow-hidden shadow-lg border-2 border-[#FF4081] glass-effect`}
                style={{
                  width: '220px',
                  height: '150px',
                  top: `${20 + (index * 15)}%`,
                  left: `${10 + (index * 5)}%`,
                  transform: `rotate(${index * 5 - 10}deg)`,
                  zIndex: 10 - index
                }}
              >
                <img 
                  src={src} 
                  alt={`Coding image ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Feature Cards */}
        <div className="flex flex-col items-center gap-8 mb-16 fade-in">
          <h2 className="text-3xl font-bold mb-8 gradient-text">Explore Our Features</h2>
          
          {/* Problems */}
          <div className="flex w-full justify-start">
            <div
              onClick={() => navigate('/problems')}
              className="feature-card w-full md:w-1/2 bg-[#2D2D2D] border-2 border-[#FF4081] text-white rounded-lg shadow-lg p-8 cursor-pointer hover:shadow-xl transition duration-300 card-hover"
            >
              <div className="flex items-center justify-center mb-6">
                <FaCode className="w-12 h-12 text-[#FF4081]" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Problems</h2>
              <p>Browse and solve coding challenges across multiple languages and difficulty levels. Track your progress and earn badges as you improve.</p>
            </div>
          </div>
          
          {/* Premium */}
          <div className="flex w-full justify-end">
            <div
              onClick={() => navigate('/premium')}
              className="feature-card w-full md:w-1/2 bg-[#2D2D2D] border-2 border-[#FF4081] text-white rounded-lg shadow-lg p-8 cursor-pointer hover:shadow-xl transition duration-300 card-hover"
            >
              <div className="flex items-center justify-center mb-6">
                <FaRocket className="w-12 h-12 text-[#FF4081]" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Premium</h2>
              <p>Unlock advanced features, specialized problems, and AI-assisted learning with premium membership. Get detailed insights and personalized recommendations.</p>
            </div>
          </div>
          
          {/* Profile */}
          <div className="flex w-full justify-start">
            <div
              onClick={() => navigate('/profile')}
              className="feature-card w-full md:w-1/2 bg-[#2D2D2D] border-2 border-[#FF4081] text-white rounded-lg shadow-lg p-8 cursor-pointer hover:shadow-xl transition duration-300 card-hover"
            >
              <div className="flex items-center justify-center mb-6">
                <FaUserAstronaut className="w-12 h-12 text-[#FF4081]" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Profile</h2>
              <p>View your stats, track your progress, and showcase your achievements. Compare your performance with friends and participate in the community leaderboard.</p>
            </div>
          </div>
        </div>
        
        {/* Coding Tips Section */}
        <div className="mb-16 text-center py-8 border-y border-[#FF4081] bg-[#1E1E1E] rounded-lg">
          <h3 className="text-2xl font-semibold mb-6 gradient-text">Coding Tips & Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
            <div className="bg-[#2D2D2D] p-6 rounded-lg border border-[#FF4081] hover:border-[#FF80AB] transition-colors">
              <h4 className="text-lg font-medium mb-3 text-[#FF4081]">Practice Regularly</h4>
              <p className="text-sm text-gray-300">Consistency is key. Set aside time each day to solve at least one problem and review your solutions.</p>
            </div>
            <div className="bg-[#2D2D2D] p-6 rounded-lg border border-[#FF4081] hover:border-[#FF80AB] transition-colors">
              <h4 className="text-lg font-medium mb-3 text-[#FF4081]">Master Data Structures</h4>
              <p className="text-sm text-gray-300">Understanding arrays, linked lists, trees, and graphs is fundamental to solving complex algorithmic problems.</p>
            </div>
            <div className="bg-[#2D2D2D] p-6 rounded-lg border border-[#FF4081] hover:border-[#FF80AB] transition-colors">
              <h4 className="text-lg font-medium mb-3 text-[#FF4081]">Analyze Time Complexity</h4>
              <p className="text-sm text-gray-300">Always consider the efficiency of your solutions. A working solution that's too slow won't pass in competitive environments.</p>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div id="cta" className="text-center mt-16 mb-24 py-16 glass-effect rounded-xl">
          <h2 className="text-3xl font-bold mb-6 gradient-text">Ready to Level Up Your Coding Skills?</h2>
          <p className="mb-8 max-w-2xl mx-auto">Join thousands of developers who are improving their skills and building their careers with Cavélix.</p>
          <button
            onClick={() => navigate('/problems')}
            className="bg-[#FF4081] py-4 px-8 rounded-lg text-white font-bold hover:bg-[#F06292] transition-all duration-300 transform hover:scale-105 btn-hover-effect"
          >
            Start Solving Problems
          </button>
        </div>
        
        {/* Chatbot */}
        <div className="fixed z-[1000000] bottom-4 right-5">
          {!showChatBot ? (
            <Tooltip title="Chat with a bot">
              <div className="bg-[#FF4081] rounded-full p-2 cursor-pointer shadow-lg pulse-animation" onClick={() => setShowChatBot(true)}>
                <IoIosHelpCircleOutline
                  size={40}
                  className="text-white"
                />
              </div>
            </Tooltip>
          ) : (
            <>
              <div className="flex justify-end mb-2">
                <button 
                  onClick={() => setShowChatBot(false)}
                  className="bg-[#2D2D2D] text-white rounded-full p-1 text-xs"
                >
                  Close
                </button>
              </div>
              <ChatBot />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;