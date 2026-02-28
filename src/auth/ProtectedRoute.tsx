import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const auth = useContext(AuthContext);
  
  if (auth?.loading) {
    return <div>Loading...</div>;
  }

  return auth?.token ? <>{children}</> : <Navigate to="/login" replace />;
}
