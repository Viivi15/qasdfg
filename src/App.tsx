import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AddProduct from './pages/AddProduct';
import ProductDetails from './pages/ProductDetails';
import Assistant from './pages/Assistant';
import Notifications from './pages/Notifications';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/add-product" element={
            <ProtectedRoute>
              <AddProduct />
            </ProtectedRoute>
          } />
          
          <Route path="/product/:id" element={
            <ProtectedRoute>
              <ProductDetails />
            </ProtectedRoute>
          } />
          
          <Route path="/assistant" element={
            <ProtectedRoute>
              <Assistant />
            </ProtectedRoute>
          } />
          
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
