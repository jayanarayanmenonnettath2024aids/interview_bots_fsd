import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-600">
        Loading AI Interview Bot...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  return children;
}
