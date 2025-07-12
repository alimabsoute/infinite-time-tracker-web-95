import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Calendar from "./pages/Calendar";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import { AuthProvider } from "./context/AuthContext";
import { QueryClient } from "./components/QueryClient";
import { Toaster } from "@/components/ui/toaster";
import { SubscriptionProvider } from "./context/SubscriptionContext";
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
                <Route path="/calendar" element={<Calendar />} />
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
