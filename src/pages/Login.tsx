import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";
import { AuthContext } from "../auth/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      auth?.login(res.data);
      navigate("/");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Login failed";
      setError(msg);
      if (msg.includes("Database")) {
        alert(msg); // Force attention to DB error
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold mb-6 text-center">Login to Warranty Vault</h1>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition">
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
