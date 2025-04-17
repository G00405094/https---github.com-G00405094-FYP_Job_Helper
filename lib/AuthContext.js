import { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';

// Create the authentication context
const AuthContext = createContext();

// Provider component to wrap the application
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user on initial page load
  useEffect(() => {
    async function loadUserFromSession() {
      try {
        console.log('Fetching user session...');
        const res = await fetch('/api/auth/user');
        console.log('User API response:', res.status);
        
        if (res.ok) {
          const data = await res.json();
          console.log('User data received:', data);
          setUser(data.user);
        } else {
          console.log('No valid user session found');
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    
    loadUserFromSession();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      console.log('Attempting login...');
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      console.log('Login response status:', res.status);
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Login failed');
      }
      
      const data = await res.json();
      console.log('Login successful, user data:', data);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  // Signup function
  const signup = async (name, email, password) => {
    try {
      console.log('Attempting signup...');
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
      
      console.log('Signup response status:', res.status);
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Registration failed');
      }
      
      console.log('Signup successful, proceeding to login');
      // Auto-login after signup
      return await login(email, password);
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('Attempting logout...');
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      console.log('Logout response status:', res.status);
      
      if (!res.ok) {
        throw new Error('Logout failed');
      }
      
      console.log('Logout successful');
      setUser(null);
      router.push('/auth/login');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  // Value to be provided by the context
  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    signup,
    logout,
  };

  console.log('Auth state:', { 
    isAuthenticated: !!user, 
    loading, 
    currentPath: router.pathname 
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 