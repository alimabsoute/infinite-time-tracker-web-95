
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Home = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Redirect authenticated users to the main app
  if (user) {
    return <Navigate to="/calendar" replace />;
  }

  // Redirect unauthenticated users to landing page
  return <Navigate to="/landing" replace />;
};

export default Home;
