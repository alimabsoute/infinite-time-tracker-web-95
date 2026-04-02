import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "@/features/auth/components/ProtectedRoute";

// Public pages
const Home = lazy(() => import("@features/landing/pages/HomePage"));
const Landing = lazy(() => import("@features/landing/pages/LandingPage"));
const Login = lazy(() => import("@features/auth/components/Login"));
const Signup = lazy(() => import("@features/auth/components/Signup"));
const ResetPassword = lazy(() => import("@features/auth/components/ResetPassword"));
const About = lazy(() => import("@features/landing/pages/AboutPage"));
const Help = lazy(() => import("@features/landing/pages/HelpPage"));
const Contact = lazy(() => import("@features/landing/pages/ContactPage"));
const PrivacyPolicy = lazy(() => import("@features/landing/pages/PrivacyPolicyPage"));
const TermsOfService = lazy(() => import("@features/landing/pages/TermsOfServicePage"));
const NotFound = lazy(() => import("@shared/pages/NotFoundPage"));

// Authenticated pages
const Dashboard = lazy(() => import("@features/timer/pages/DashboardPage"));
const Calendar = lazy(() => import("@features/calendar/pages/CalendarPage"));
const Analytics = lazy(() => import("@features/analytics/pages/AnalyticsPage"));
const Reports = lazy(() => import("@features/reports/pages/ReportsPage"));
const Settings = lazy(() => import("@features/settings/pages/SettingsPage"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
  </div>
);

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />

        {/* Authenticated routes */}
        <Route path="/app" element={<ProtectedRoute />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
