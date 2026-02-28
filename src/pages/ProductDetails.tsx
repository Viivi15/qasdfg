import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { ChevronLeft, Download, Phone, Mail, Globe, Bell, Trash2 } from "lucide-react";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
      if (res.data.brand) {
        const sRes = await api.get(`/service/${res.data.brand}`);
        setService(sRes.data.info);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function sendTestReminder() {
    try {
      await api.post("/notifications/test", { productId: id });
      alert("Test reminder sent! Check your email.");
    } catch (err) {
      alert("Failed to send reminder.");
    }
  }

  async function deleteProduct() {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      navigate("/");
    } catch (err) {
      alert("Failed to delete.");
    }
  }

  if (loading) return <div className="p-8 text-center">Loading details...</div>;
  if (!product) return <div className="p-8 text-center">Product not found.</div>;

  const daysLeft = Math.ceil((new Date(product.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isExpired = daysLeft < 0;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 mb-4 hover:text-black">
        <ChevronLeft size={20} /> Back
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-1">{product.productName}</h1>
            <p className="text-gray-500">{product.brand} • {product.category}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${isExpired ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {isExpired ? "EXPIRED" : "ACTIVE"}
          </div>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Purchase Date</label>
              <p className="font-medium">{new Date(product.purchaseDate).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Warranty Expiry</label>
              <p className="font-medium text-lg">{new Date(product.expiryDate).toLocaleDateString()}</p>
              <p className={`text-sm ${isExpired ? "text-red-500" : "text-green-500"}`}>
                {isExpired ? `Expired ${Math.abs(daysLeft)} days ago` : `${daysLeft} days remaining`}
              </p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Warranty Period</label>
              <p className="font-medium">{product.warrantyMonths} Months</p>
            </div>
          </div>

          <div className="space-y-4">
             {product.invoiceFileUrl ? (
               <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                 <p className="font-medium mb-2">Invoice</p>
                 <a 
                   href={product.invoiceFileUrl} 
                   target="_blank" 
                   rel="noreferrer"
                   className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
                 >
                   <Download size={16} /> View / Download Invoice
                 </a>
               </div>
             ) : (
               <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-400 text-sm italic">
                 No invoice uploaded.
               </div>
             )}

             <div className="pt-4 border-t border-gray-100">
               <h3 className="font-bold mb-3">Actions</h3>
               <div className="flex gap-2">
                 <button onClick={sendTestReminder} className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 py-2 rounded-lg text-sm font-medium transition">
                   <Bell size={16} /> Test Reminder
                 </button>
                 <button onClick={deleteProduct} className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg transition">
                   <Trash2 size={16} />
                 </button>
               </div>
             </div>
          </div>
        </div>

        {service && (
          <div className="bg-blue-50 p-6 border-t border-blue-100">
            <h3 className="font-bold text-blue-900 mb-3">Service Directory: {product.brand}</h3>
            <div className="flex flex-wrap gap-4">
              {service.phone && (
                <a href={`tel:${service.phone}`} className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm text-blue-700 hover:shadow-md transition">
                  <Phone size={16} /> {service.phone}
                </a>
              )}
              {service.website && (
                <a href={service.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm text-blue-700 hover:shadow-md transition">
                  <Globe size={16} /> Official Support
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
