import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import OrdersPage from "@/pages/OrdersPage";
import ShopOwnersPage from "@/pages/admin/ShopOwnersPage";
import AnalyticsPage from "@/pages/admin/AnalyticsPage";
import ShopBrowse from "@/pages/shop/ShopBrowse";
import CartPage from "@/pages/shop/CartPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function HomePage() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminDashboard /> : <ShopBrowse />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route element={<AppLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<AdminProducts />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/shop-owners" element={<ShopOwnersPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/cart" element={<CartPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
