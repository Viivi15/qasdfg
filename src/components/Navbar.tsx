import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { LogOut, Plus, MessageSquare, Bell, Home } from "lucide-react";

export default function Navbar() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  if (!auth?.token) return null;

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="font-bold text-xl flex items-center gap-2">
        <span className="bg-black text-white p-1 rounded">WV</span>
        <span className="hidden sm:inline">Warranty Vault</span>
      </Link>
      
      <div className="flex items-center gap-4">
        <Link to="/add-product" className="p-2 hover:bg-gray-100 rounded-full" title="Add Product">
          <Plus size={20} />
        </Link>
        <Link to="/assistant" className="p-2 hover:bg-gray-100 rounded-full" title="Assistant">
          <MessageSquare size={20} />
        </Link>
        <Link to="/notifications" className="p-2 hover:bg-gray-100 rounded-full" title="Notifications">
          <Bell size={20} />
        </Link>
        <button 
          onClick={() => { auth.logout(); navigate("/login"); }}
          className="p-2 hover:bg-gray-100 rounded-full text-red-500"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
}
