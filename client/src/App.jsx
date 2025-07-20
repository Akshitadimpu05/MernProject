import React, { useEffect } from 'react';
import './styles/theme.css'; // Import our custom theme styles
import './styles/custom-colors.css'; // Import custom color overrides
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser } from './redux/slices/userSlice';
import Login from './pages/login';
import Register from './pages/register';
import Home from './pages/Home';
import Contests from './pages/Contests';
import ContestDetails from './pages/ContestDetails';
import Problems from './pages/Problems';
import ProblemDetails from './pages/ProblemDetails';
import Profile from './components/Profile';
import Premium from './components/Premium';
import Resources from './pages/Resources';
import Navbar from './components/Navbar';
import AdminDashboard from './pages/AdminDashboard';
import CreateContest from './pages/CreateContest';
import CreateProblem from './pages/CreateProblem';
import ContestProblem from './components/ContestProblem';
import ContestSubmissionsView from './components/admin/ContestSubmissionsView';

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
    return <div className="min-h-screen flex items-center justify-center bg-[#FFB6C1]">
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

// Admin route component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useSelector(state => state.user);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FFB6C1]">
      <div className="text-white text-xl">Loading...</div>
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" />;
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
          <div className="min-h-screen bg-dark-bg">
            <Login />
          </div>
        } />
        <Route path="/register" element={
          <div className="min-h-screen bg-dark-bg">
            <Register />
          </div>
        } />
        
        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/contests" element={<ProtectedRoute><Contests /></ProtectedRoute>} />
        <Route path="/contests/:id" element={<ProtectedRoute><ContestDetails /></ProtectedRoute>} />
        <Route path="/contests/:contestId/problems/:problemId/solve" element={<ProtectedRoute><ContestProblem /></ProtectedRoute>} />
        <Route path="/problems" element={<ProtectedRoute><Problems /></ProtectedRoute>} />
        <Route path="/problems/:id" element={<ProtectedRoute><ProblemDetails /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/premium" element={<ProtectedRoute><Premium /></ProtectedRoute>} />
        <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/contest/create" element={<AdminRoute><CreateContest /></AdminRoute>} />
        <Route path="/admin/problem/create" element={<AdminRoute><CreateProblem /></AdminRoute>} />
        <Route path="/admin/contests/:contestId/submissions" element={<AdminRoute><ContestSubmissionsView /></AdminRoute>} />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;