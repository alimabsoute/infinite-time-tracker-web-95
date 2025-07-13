
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import { AuthProvider } from "./contexts/AuthContext";
import { QueryClient } from "./components/QueryClient";
import { Toaster } from "@/components/ui/toaster";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import ErrorBoundary from "./components/ErrorBoundary";
import FoodManufacturerDemo from "./pages/FoodManufacturerDemo";

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <QueryClient>
          <AuthProvider>
            <SubscriptionProvider>
              <Toaster />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/advanced-analytics" element={<AdvancedAnalytics />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/food-demo" element={<FoodManufacturerDemo />} />
              </Routes>
            </SubscriptionProvider>
          </AuthProvider>
        </QueryClient>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
