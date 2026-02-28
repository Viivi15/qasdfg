import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import InvoiceOcrUploader from "../components/InvoiceOcrUploader";
import { ChevronLeft } from "lucide-react";

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    productName: "",
    brand: "",
    category: "Electronics",
    purchaseDate: "",
    warrantyMonths: 12,
    invoiceText: "",
    invoiceFileUrl: ""
  });

  async function uploadInvoice(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await api.post("/upload/invoice", fd, { headers: { "Content-Type": "multipart/form-data" } });
    return res.data.fileUrl;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      let invoiceFileUrl = "";
      if (file) {
        invoiceFileUrl = await uploadInvoice(file);
      }

      await api.post("/products", {
        ...form,
        invoiceFileUrl,
        warrantyMonths: Number(form.warrantyMonths)
      });
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Failed to save product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 mb-4 hover:text-black">
        <ChevronLeft size={20} /> Back
      </button>
      
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
        <InvoiceOcrUploader
          onExtract={(data) => {
            setForm(f => ({ ...f, ...data }));
            setFile(data.file);
          }}
        />
      </div>

      <form className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
          <input className="w-full p-2 border rounded-lg" placeholder="e.g. Samsung Galaxy S24"
            value={form.productName} onChange={e=>setForm(f=>({...f, productName:e.target.value}))} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <input className="w-full p-2 border rounded-lg" placeholder="e.g. Samsung"
              value={form.brand} onChange={e=>setForm(f=>({...f, brand:e.target.value}))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input className="w-full p-2 border rounded-lg" placeholder="e.g. Electronics"
              value={form.category} onChange={e=>setForm(f=>({...f, category:e.target.value}))} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
            <input className="w-full p-2 border rounded-lg" type="date"
              value={form.purchaseDate} onChange={e=>setForm(f=>({...f, purchaseDate:e.target.value}))} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Period</label>
            <select className="w-full p-2 border rounded-lg"
              value={form.warrantyMonths} onChange={e=>setForm(f=>({...f, warrantyMonths:Number(e.target.value)}))}>
              <option value={6}>6 months</option>
              <option value={12}>12 months</option>
              <option value={24}>24 months</option>
              <option value={36}>36 months</option>
            </select>
          </div>
        </div>

        <button disabled={loading} className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50">
          {loading ? "Saving..." : "Save Product"}
        </button>
      </form>
    </div>
  );
}
