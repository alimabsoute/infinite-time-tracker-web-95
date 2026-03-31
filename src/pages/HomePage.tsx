import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import Landing from '@/pages/Landing';

/**
 * HomePage — thin shell
 * Redirects authenticated users to /dashboard, shows Landing for guests.
 */
export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Landing />;
}
