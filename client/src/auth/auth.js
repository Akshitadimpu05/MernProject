// Simple authentication helper
const auth = {
    isAuthenticated: localStorage.getItem("token") ? true : false,
    
    login(callback) {
      this.isAuthenticated = true;
      callback();
    },
    
    logout(callback) {
      this.isAuthenticated = false;
      callback();
    },
    
    // Check if token is valid on app initialization
    checkAuth() {
      const token = localStorage.getItem("token");
      if (token) {
        // Here you would typically validate the token with your backend
        // For now, we'll just set isAuthenticated to true if a token exists
        this.isAuthenticated = true;
      } else {
        this.isAuthenticated = false;
      }
    }
  };
  
  // Initialize auth state
  auth.checkAuth();
  
  export { auth };