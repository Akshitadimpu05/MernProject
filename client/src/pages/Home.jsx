import { useNavigate } from "react-router-dom";
import { auth } from "../auth/auth.js";
import CodeEditor from "../components/CodeEditor";

function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    auth.logout(() => navigate("/login"));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Hello World Problem</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <CodeEditor />
      </main>
    </div>
  );
}

export default Home;
