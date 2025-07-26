import React, { useState } from 'react';
import { IoIosHelpCircleOutline, IoMdClose } from 'react-icons/io';
import { FaRobot } from 'react-icons/fa';

// FAQ data
const faqData = [
  {
    id: 1,
    question: "How do I get started with Cavélix?",
    answer: "Sign up for an account, then navigate to the Problems page to start solving coding challenges. Begin with easy problems and work your way up as you gain confidence."
  },
  {
    id: 2,
    question: "What programming languages are supported?",
    answer: "Cavélix currently supports C++, Java, and Python. We're constantly working to add more languages based on user feedback."
  },
  {
    id: 3,
    question: "How do I track my progress?",
    answer: "Visit your Profile page to see statistics on problems solved, submission history, and your performance across different difficulty levels."
  },
  {
    id: 4,
    question: "What are the benefits of Premium membership?",
    answer: "Premium members get access to exclusive problems, AI-powered code analysis, personalized learning paths, and priority support."
  },
  {
    id: 5,
    question: "How do contests work?",
    answer: "Contests run for a specific duration where you solve problems and earn points based on correctness and efficiency. Join contests from the Contests page."
  },
  {
    id: 6,
    question: "How are problems categorized by difficulty?",
    answer: "Problems are categorized as Easy, Medium, or Hard based on complexity, required algorithms, and typical solution time. This helps you choose challenges that match your skill level."
  },
  {
    id: 7,
    question: "Can I use external libraries in my solutions?",
    answer: "Yes, you can use standard libraries available in your chosen programming language. However, external third-party packages are not supported in the execution environment."
  },
  {
    id: 8,
    question: "How do I report a bug or suggest a feature?",
    answer: "Contact us at support@cavelix.com with your feedback. We appreciate bug reports and feature suggestions to improve the platform for everyone."
  },
  {
    id: 9,
    question: "Is there a time limit for solving problems?",
    answer: "Regular practice problems have no time limit. Contest problems must be solved within the contest duration. Each submission has a maximum execution time limit to ensure efficient solutions."
  },
  {
    id: 10,
    question: "How does the ranking system work?",
    answer: "Rankings are calculated based on the number of problems solved, their difficulty levels, and your participation in contests. Consistent practice and solving harder problems will improve your rank."
  }
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [chatHistory, setChatHistory] = useState([
    { type: 'bot', text: "Hi! I'm the Cavélix Assistant. How can I help you today?" }
  ]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Reset chat when opening
      setChatHistory([
        { type: 'bot', text: "Hi! I'm the Cavélix Assistant. How can I help you today?" }
      ]);
      setSelectedQuestion(null);
    }
  };

  const handleQuestionClick = (question) => {
    const faq = faqData.find(item => item.id === question.id);
    
    // Add user question to chat
    setChatHistory([
      ...chatHistory,
      { type: 'user', text: faq.question }
    ]);
    
    // Add bot response after a small delay to simulate typing
    setTimeout(() => {
      setChatHistory(prev => [
        ...prev,
        { type: 'bot', text: faq.answer }
      ]);
    }, 500);
    
    setSelectedQuestion(question.id);
  };

  return (
    <div className="fixed z-[1000] bottom-4 right-4">
      {isOpen ? (
        <div className="bg-[#1E1E1E] w-80 rounded-lg shadow-xl border-2 border-[#ff16ac] overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="bg-[#ff16ac] p-3 flex justify-between items-center">
            <div className="flex items-center">
              <FaRobot className="text-white text-xl mr-2" />
              <h3 className="text-white font-medium">Cavélix Assistant</h3>
            </div>
            <button 
              onClick={toggleChatbot}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <IoMdClose size={20} />
            </button>
          </div>
          
          {/* Chat area */}
          <div className="h-64 overflow-y-auto p-3 bg-[#2D2D2D] custom-scrollbar">
            {chatHistory.map((message, index) => (
              <div 
                key={index} 
                className={`mb-3 ${message.type === 'user' ? 'text-right' : ''}`}
              >
                <div 
                  className={`inline-block rounded-lg px-3 py-2 max-w-[80%] ${
                    message.type === 'user' 
                      ? 'bg-[#ff16ac] text-white' 
                      : 'bg-[#3D3D3D] text-white'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
          
          {/* FAQ section */}
          <div className="p-3 border-t border-gray-700">
            <p className="text-[#ff16ac] text-sm font-medium mb-2">Frequently Asked Questions:</p>
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
              {faqData.map(faq => (
                <div
                  key={faq.id}
                  onClick={() => handleQuestionClick(faq)}
                  className={`text-sm p-2 rounded cursor-pointer transition-colors ${
                    selectedQuestion === faq.id
                      ? 'bg-[#3D3D3D] text-white'
                      : 'text-gray-300 hover:bg-[#3D3D3D]'
                  }`}
                >
                  {faq.question}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={toggleChatbot}
          className="bg-[#ff16ac] hover:bg-[#FE59D7] text-white rounded-full p-3 shadow-lg transition-colors flex items-center justify-center pulse-animation"
        >
          <IoIosHelpCircleOutline size={30} />
        </button>
      )}
    </div>
  );
};

export default Chatbot;
