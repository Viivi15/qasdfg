import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { Search, Filter, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface Product {
  _id: string;
  productName: string;
  brand: string;
  category: string;
  purchaseDate: string;
  expiryDate: string;
  warrantyMonths: number;
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, expiring

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  async function fetchProducts() {
    setLoading(true);
    try {
      const params: any = {};
      if (filter === "expiring") params.expiringSoon = "true";
      const res = await api.get("/products", { params });
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = products.filter(p => 
    p.productName.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  function getDaysLeft(expiry: string) {
    const diff = new Date(expiry).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">My Products</h1>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          
          <select 
            className="border rounded-lg px-3 py-2 bg-white"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="all">All Products</option>
            <option value="expiring">Expiring Soon</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading vault...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-500 mb-4">No products found.</p>
          <Link to="/add-product" className="bg-black text-white px-4 py-2 rounded-lg">Add First Product</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => {
            const days = getDaysLeft(p.expiryDate);
            const isExpired = days < 0;
            const isSoon = days > 0 && days <= 30;

            return (
              <Link to={`/product/${p._id}`} key={p._id} className="block group">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition relative overflow-hidden">
                  {isExpired && <div className="absolute top-0 right-0 bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-bl-lg">EXPIRED</div>}
                  {isSoon && <div className="absolute top-0 right-0 bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-bl-lg">EXPIRING SOON</div>}
                  
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-blue-600 transition">{p.productName}</h3>
                      <p className="text-sm text-gray-500">{p.brand} • {p.category}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm">
                    {isExpired ? (
                      <AlertTriangle size={16} className="text-red-500" />
                    ) : isSoon ? (
                      <Clock size={16} className="text-yellow-500" />
                    ) : (
                      <CheckCircle size={16} className="text-green-500" />
                    )}
                    <span className={isExpired ? "text-red-600 font-medium" : isSoon ? "text-yellow-600 font-medium" : "text-green-600 font-medium"}>
                      {isExpired ? `Expired ${Math.abs(days)} days ago` : `${days} days left`}
                    </span>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-400">
                    Expires: {new Date(p.expiryDate).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
