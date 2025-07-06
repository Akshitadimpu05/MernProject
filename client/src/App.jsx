import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/login";
import Register from "./pages/register";
import Problems from "./pages/Problems";
import ProtectedRoute from "./components/ProtectedRoute";
import ProblemDetails from "./pages/ProblemDetails"
import "./index.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/problems" 
          element={
            <ProtectedRoute>
              <Problems />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/problem/:id" 
          element={
            <ProtectedRoute>
              <ProblemDetails />
            </ProtectedRoute>
          } 
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;