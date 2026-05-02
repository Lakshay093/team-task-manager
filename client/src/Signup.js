import { useState } from "react";
import API from "./api";

export default function Signup({ setShowSignup }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin"
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const signup = async () => {
    setLoading(true);
    try {
      await API.post("/auth/signup", form);
      alert("Signup successful! Please login.");
      setShowSignup(false);
    } catch (err) {
      alert(err.response?.data?.msg || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 w-full max-w-md transform transition-all hover:scale-[1.01]">
        <h1 className="text-4xl font-extrabold text-white mb-6 text-center tracking-tight">
          Create Account
        </h1>
        <p className="text-indigo-100 text-center mb-8">Join Team Task Manager today</p>

        <div className="space-y-4">
          <div>
            <input
              name="name"
              className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
              placeholder="Full Name"
              onChange={handleChange}
            />
          </div>

          <div>
            <input
              name="email"
              className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
              placeholder="Email Address"
              onChange={handleChange}
            />
          </div>

          <div>
            <input
              name="password"
              className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
              type="password"
              placeholder="Password"
              onChange={handleChange}
            />
          </div>

          <div>
            <select
              name="role"
              className="w-full px-5 py-3 rounded-xl bg-indigo-900/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 appearance-none"
              onChange={handleChange}
            >
              <option value="admin">Admin</option>
              <option value="member">Member</option>
            </select>
          </div>

          <button 
            onClick={signup}
            disabled={loading}
            className="w-full py-3 mt-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-300 shadow-lg"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-indigo-100">
            Already have an account?{" "}
            <button 
              onClick={() => setShowSignup(false)}
              className="text-white font-semibold hover:underline decoration-2 underline-offset-4 transition-all"
            >
              Log in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}