import { useState } from "react";
import API from "./api";

export default function Login({ setAuth, setShowSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      setAuth(true);
    } catch (err) {
      alert(err.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 w-full max-w-md transform transition-all hover:scale-[1.01]">
        <h1 className="text-4xl font-extrabold text-white mb-6 text-center tracking-tight">
          Welcome Back
        </h1>
        <p className="text-indigo-100 text-center mb-8">Sign in to continue to Team Task Manager</p>

        <div className="space-y-4">
          <div>
            <input
              className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
              placeholder="Email Address"
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <input
              className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
              placeholder="Password"
              type="password"
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            onClick={login}
            disabled={loading}
            className="w-full py-3 mt-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-300 shadow-lg"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-indigo-100">
            Don't have an account?{" "}
            <button 
              onClick={() => setShowSignup(true)}
              className="text-white font-semibold hover:underline decoration-2 underline-offset-4 transition-all"
            >
              Sign up now
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}