import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from './AuthContext';

/**
 * Higher-order component to protect routes that require authentication
 * 
 * @param {React.Component} Component - The component to be protected
 * @returns {React.Component} - A wrapped component with authentication protection
 */
export default function withAuth(Component) {
  return function ProtectedRoute(props) {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      // Wait for the authentication state to be loaded
      if (!loading) {
        if (!isAuthenticated) {
          // Redirect to login if not authenticated
          router.push('/auth/login');
        } else {
          setIsChecking(false);
        }
      }
    }, [isAuthenticated, loading, router]);

    // Show nothing during auth check
    if (loading || isChecking) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Loading...</div>
        </div>
      );
    }

    // Render the component if authenticated
    return <Component {...props} />;
  };
} 