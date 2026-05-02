import { useState, useEffect } from "react";
import Dashboard from "./Dashboard";
import Projects from "./Projects";
import Login from "./Login";
import Signup from "./Signup";

const decodeToken = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

export default function App() {
  const [auth, setAuth] = useState(!!localStorage.getItem("token"));
  const [showSignup, setShowSignup] = useState(false);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");

  useEffect(() => {
    if (auth) {
      const token = localStorage.getItem("token");
      const decoded = decodeToken(token);
      setUser(decoded);
    } else {
      setUser(null);
    }
  }, [auth]);

  if (!auth) {
    return showSignup ? (
      <Signup setShowSignup={setShowSignup} />
    ) : (
      <Login setAuth={setAuth} setShowSignup={setShowSignup} />
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuth(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      <nav className="bg-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center space-x-8">
              <span className="text-white text-xl font-bold tracking-tight">
                Team Task Manager
              </span>
              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentView("dashboard")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'dashboard' ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-500 hover:text-white'}`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView("projects")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'projects' ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-500 hover:text-white'}`}
                >
                  Projects
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <span className="text-indigo-200 text-sm">
                  Role: <strong className="text-white capitalize">{user.role}</strong>
                </span>
              )}
              <button 
                onClick={handleLogout}
                className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-indigo-400"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full mx-auto">
        {currentView === "dashboard" ? <Dashboard user={user} /> : <Projects user={user} />}
      </main>
    </div>
  );
}