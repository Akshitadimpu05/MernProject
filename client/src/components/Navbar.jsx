import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { auth } from '../auth/auth';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector(state => state.user);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  const handleLogout = () => {
    auth.logout(() => navigate('/login'));
    setShowDropdown(false);
  };
  
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Determine if a nav link is active
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-primary-pink shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section - Logo and website name */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <svg 
                className="h-8 w-8 text-white" 
                fill="none"
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth="2"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                />
              </svg>
              <span className="ml-2 text-xl font-bold text-white">Cavélix</span>
            </Link>
          </div>
          
          {/* Middle section - Navigation buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/contests"
              className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                isActive('/contests') 
                  ? 'bg-secondary-pink' 
                  : 'bg-dark-bg hover:bg-secondary-pink'
              } transition-colors`}
            >
              Contests
            </Link>
            <Link
              to="/problems"
              className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                isActive('/problem') 
                  ? 'bg-secondary-pink' 
                  : 'bg-dark-bg hover:bg-secondary-pink'
              } transition-colors`}
            >
              Problems
            </Link>
            <Link
              to="/premium"
              className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                isActive('/premium') 
                  ? 'bg-secondary-pink' 
                  : 'bg-dark-bg hover:bg-secondary-pink'
              } transition-colors`}
            >
              Premium
            </Link>
            {user?.isPremium && (
              <Link
                to="/resources"
                className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                  isActive('/resources')
                    ? 'bg-secondary-pink'
                    : 'bg-dark-bg hover:bg-secondary-pink'
                } transition-colors flex items-center`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Resources
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                  isActive('/admin')
                    ? 'bg-[#3B1C32]'
                    : 'bg-[#1A1A1D] hover:bg-[#3B1C32]'
                } transition-colors`}
              >
                Admin
              </Link>
            )}
          </div>
          
          {/* Right section - User profile */}
          <div className="flex items-center">
            <div className="relative" ref={dropdownRef}>
              <div 
                onClick={toggleDropdown}
                className="flex items-center cursor-pointer group"
              >
                <span className="text-white mr-2 hidden md:block">
                  Hola, {user?.username || user?.name || 'User'}
                </span>
                <div className="h-8 w-8 rounded-full bg-dark-bg flex items-center justify-center text-white hover:bg-secondary-pink transition-colors">
                  {(user?.username || user?.name || 'U').charAt(0).toUpperCase()}
                </div>
              </div>
              
              {/* Dropdown menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-pink hover:text-white"
                    onClick={() => setShowDropdown(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-pink hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile navigation */}
        <div className="md:hidden py-2 flex justify-center space-x-4">
          <Link
            to="/contests"
            className={`px-3 py-1 rounded-md text-sm font-medium text-white ${
              isActive('/contests') 
                ? 'bg-secondary-pink' 
                : 'bg-dark-bg hover:bg-secondary-pink'
            } transition-colors`}
          >
            Contests
          </Link>
          <Link
            to="/problems"
            className={`px-3 py-1 rounded-md text-sm font-medium text-white ${
              isActive('/problem') 
                ? 'bg-secondary-pink' 
                : 'bg-dark-bg hover:bg-secondary-pink'
            } transition-colors`}
          >
            Problems
          </Link>
          <Link
            to="/premium"
            className={`px-3 py-1 rounded-md text-sm font-medium text-white ${
              isActive('/premium') 
                ? 'bg-secondary-pink' 
                : 'bg-dark-bg hover:bg-secondary-pink'
            } transition-colors`}
          >
            Premium
          </Link>
          {user?.isPremium && (
            <Link
              to="/resources"
              className={`px-3 py-1 rounded-md text-sm font-medium text-white ${
                isActive('/resources')
                  ? 'bg-secondary-pink'
                  : 'bg-dark-bg hover:bg-secondary-pink'
              } transition-colors flex items-center`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Res
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`px-3 py-1 rounded-md text-sm font-medium text-white ${
                isActive('/admin')
                  ? 'bg-[#3B1C32]'
                  : 'bg-[#1A1A1D] hover:bg-[#3B1C32]'
              } transition-colors`}
            >
              Admin
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;