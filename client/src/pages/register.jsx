import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../redux/slices/userSlice';
import videoUrl from '/videos/bgpie2.mp4';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const { username, email, password, confirmPassword } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, isAuthenticated } = useSelector(state => state.user);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
    dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      await dispatch(registerUser({ username, email, password })).unwrap();
      navigate('/problems');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return (
    <div className="relative w-full min-h-screen">
      {/* Background video imported as a module */}
      <video 
        src={videoUrl}
        className="absolute inset-0 w-full h-full object-cover" 
        autoPlay 
        loop 
        muted 
        playsInline
      ></video>
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-opacity-20"></div>
      {/* Removed black overlay to make video fully visible */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-black bg-opacity-40 p-10 rounded-xl w-full max-w-md text-white border border-white shadow-[0_0_15px_rgba(255,255,255,0.5)] backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-center mb-6">Create your account</h2>

          {error && (
            <div className="bg-red-500 text-white px-4 py-2 rounded mb-4 text-center">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              value={username}
              onChange={handleChange}
              required
              placeholder="Username"
              className="w-full px-4 py-2 rounded bg-[#1E1E1E] text-white focus:outline-none"
            />
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              required
              placeholder="Email address"
              className="w-full px-4 py-2 rounded bg-[#1E1E1E] text-white focus:outline-none"
            />
            <input
              type="password"
              name="password"
              value={password}
              onChange={handleChange}
              required
              placeholder="Password"
              className="w-full px-4 py-2 rounded bg-[#1E1E1E] text-white focus:outline-none"
            />
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm Password"
              className="w-full px-4 py-2 rounded bg-[#1E1E1E] text-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-[#1E1E1E] text-white font-semibold rounded hover:bg-gray-900"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
            <div className="text-sm text-center">
              <Link to="/login" className="text-indigo-400 hover:underline">
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
