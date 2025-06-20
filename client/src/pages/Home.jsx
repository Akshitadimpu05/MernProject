import { useNavigate } from "react-router-dom";
import { auth } from "../auth/auth.js";

function Home() {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // Clear token from localStorage
    localStorage.removeItem('token');
    // Use auth helper to update state
    auth.logout(() => navigate("/login"));
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Home Page</h1>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Logout
          </button>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
              <p className="text-xl text-gray-600">Welcome to the dashboard! You are logged in.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;