import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { auth } from "../auth/auth.js";
import CodeEditor from "../components/CodeEditor";

function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    auth.logout(() => navigate("/login"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            onClick={() => navigate('/problems')}
            className="bg-white rounded-lg shadow-lg p-8 cursor-pointer hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Problems</h2>
            <p className="text-gray-600">Browse and solve coding challenges</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
