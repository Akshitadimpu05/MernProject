import React, { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import { IoIosHelpCircleOutline } from 'react-icons/io';

gsap.registerPlugin(ScrollTrigger);

// Dummy ChatBot component (replace with real one if available)
const ChatBot = () => (
  <div className="bg-white text-black p-4 rounded shadow-lg w-64">
    <p className="font-semibold">Hi! I'm the ChatBot 🤖</p>
    <p className="text-sm mt-2">How can I help you today?</p>
  </div>
);

function Home() {
  const navigate = useNavigate();
  const [showChatBot, setShowChatBot] = useState(false);
  const comp = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
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

      gsap.from('#cta', {
        opacity: 0,
        y: 40,
        duration: 1,
        scrollTrigger: {
          trigger: '#cta',
          start: 'top 90%',
        },
      });
    }, comp);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={comp} className="bg-gradient-to-b from-[#1F1F1F] to-[#2E2E2E] min-h-screen text-white">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="min-h-screen flex flex-col justify-center items-center text-center">
          <h1 className="hero-heading text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Welcome to Cavélix
          </h1>
          <div className="overflow-hidden">
            <p className="hero-sub-line text-xl md:text-2xl font-light italic tracking-wide max-w-2xl mx-auto text-gray-200">
              Your platform for solving coding challenges and improving your skills
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="flex flex-col items-center gap-8 mb-16">
          {/* Problems */}
          <div className="flex w-full justify-start">
            <div
              onClick={() => navigate('/problems')}
              className="feature-card w-full md:w-1/2 bg-white text-black rounded-lg shadow-lg p-8 cursor-pointer hover:shadow-xl transition duration-300"
            >
              <div className="flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-[#6A1E55]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Problems</h2>
              <p>Browse and solve coding challenges</p>
            </div>
          </div>

          {/* Premium */}
          <div className="flex w-full justify-end">
            <div
              onClick={() => navigate('/premium')}
              className="feature-card w-full md:w-1/2 bg-white text-black rounded-lg shadow-lg p-8 cursor-pointer hover:shadow-xl transition duration-300"
            >
              <div className="flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-[#6A1E55]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Premium</h2>
              <p>Unlock advanced features and challenges</p>
            </div>
          </div>

          {/* Profile */}
          <div className="flex w-full justify-start">
            <div
              onClick={() => navigate('/profile')}
              className="feature-card w-full md:w-1/2 bg-white text-black rounded-lg shadow-lg p-8 cursor-pointer hover:shadow-xl transition duration-300"
            >
              <div className="flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-[#6A1E55]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Profile</h2>
              <p>View your stats and progress</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div id="cta" className="text-center mt-16">
          <button
            onClick={() => navigate('/problems')}
            className="bg-[#6A1E55] py-3 px-6 rounded-lg text-white font-semibold hover:bg-[#8c1c6b]"
          >
            Start Solving Problems
          </button>
        </div>

        {/* Chatbot */}
        <div className="fixed z-[1000000] bottom-4 right-5">
          {!showChatBot ? (
            <Tooltip title="Chat with a bot">
              <IoIosHelpCircleOutline
                size={55}
                onClick={() => setShowChatBot(true)}
                className="cursor-pointer"
                style={{ color: 'red' }}
              />
            </Tooltip>
          ) : (
            <ChatBot />
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;