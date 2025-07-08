import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser } from './redux/slices/userSlice';
import Login from './pages/login';
import Register from './pages/register';
import Home from './pages/Home';
import Problems from './pages/Problems';
import ProblemDetails from './pages/ProblemDetails';
import Profile from './components/Profile';
import Premium from './components/Premium';
import Navbar from './components/Navbar';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector(state => state.user);
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getCurrentUser());
    }
  }, [isAuthenticated, dispatch]);
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#1A1A1D]">
      <div className="text-white text-xl">Loading...</div>
    </div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#1A1A1D] pt-4">
        {children}
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          <div className="min-h-screen bg-[#1A1A1D]">
            <Login />
          </div>
        } />
        <Route path="/register" element={
          <div className="min-h-screen bg-[#1A1A1D]">
            <Register />
          </div>
        } />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/problems" element={
          <ProtectedRoute>
            <Problems />
          </ProtectedRoute>
        } />
        <Route path="/problem/:id" element={
          <ProtectedRoute>
            <ProblemDetails />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/premium" element={
          <ProtectedRoute>
            <Premium />
          </ProtectedRoute>
        } />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;