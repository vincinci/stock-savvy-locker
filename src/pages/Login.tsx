
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import { Package } from "lucide-react";

export default function Login() {
  // Check if user is already authenticated
  const isAuthenticated = !!localStorage.getItem("user");
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 mb-8">
        <Package className="h-10 w-10 text-primary" />
        <h1 className="text-3xl font-bold">StockSavvy</h1>
      </div>
      <LoginForm />
    </div>
  );
}
