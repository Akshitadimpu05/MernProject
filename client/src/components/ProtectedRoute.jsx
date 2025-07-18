import { Navigate } from "react-router-dom";
import { auth } from "../auth/auth.js";

function ProtectedRoute({ children }) {
  // Call isAuthenticated as a function
  if (!auth.isAuthenticated()) {
    // Redirect to the login page if not authenticated
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default ProtectedRoute;