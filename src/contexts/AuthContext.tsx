import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { SIGN_IN_MUTATION, SIGN_OUT_MUTATION } from '../lib/graphql/mutations';
import { GET_CURRENT_USER } from '../lib/graphql/queries';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Initialize hasToken immediately by checking localStorage synchronously
  const [hasToken, setHasToken] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('auth_token');
    }
    return false;
  });
  const [isInitializing, setIsInitializing] = useState(true);
  
  const [signInMutation] = useMutation(SIGN_IN_MUTATION);
  const [signOutMutation] = useMutation(SIGN_OUT_MUTATION);
  
  // Mark initialization as complete after first render
  useEffect(() => {
    setIsInitializing(false);
  }, []);
  
  const { loading: isLoading, data: currentUserData, error: currentUserError } = useQuery<{ currentUser: User | null }>(GET_CURRENT_USER, {
    skip: !hasToken, // Skip query if no token
    errorPolicy: 'all', // Continue even if there's an error
    fetchPolicy: 'network-only', // Always fetch to verify token is still valid
  });

  // Handle current user query result
  useEffect(() => {
    if (!hasToken) return;
    
    if (currentUserError) {
      // Token is invalid or expired, remove it
      localStorage.removeItem('auth_token');
      setHasToken(false);
      setUser(null);
      return;
    }

    if (currentUserData?.currentUser) {
      const userData = currentUserData.currentUser;
      // Ensure all required fields are present
      if (userData && userData.id && userData.email) {
        setUser(userData);
      } else {
        // Invalid user data, clear token
        localStorage.removeItem('auth_token');
        setHasToken(false);
        setUser(null);
      }
    } else if (currentUserData && !currentUserData.currentUser) {
      // Token is invalid, remove it
      localStorage.removeItem('auth_token');
      setHasToken(false);
      setUser(null);
    }
  }, [currentUserData, currentUserError, hasToken]);

  // Timeout fallback: if loading takes more than 5 seconds, assume failed and show SignIn
  useEffect(() => {
    if (hasToken && isLoading) {
      const timeout = setTimeout(() => {
        localStorage.removeItem('auth_token');
        setHasToken(false);
        setUser(null);
      }, 5000); // 5 second timeout

      return () => clearTimeout(timeout);
    }
  }, [hasToken, isLoading]);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { data } = await signInMutation({
        variables: { input: { email, password } },
      });

      const result = data as {
        signIn: {
          user: User | null;
          token: string | null;
          errors: string[] | null;
        };
      } | undefined;

      if (result?.signIn.errors && result.signIn.errors.length > 0) {
        setError(result.signIn.errors[0]);
        return;
      }

      if (result?.signIn.token && result.signIn.user) {
        localStorage.setItem('auth_token', result.signIn.token);
        setUser(result.signIn.user);
        setHasToken(true);
      }
    } catch (err) {
      setError('An error occurred during sign in');
      console.error('Sign in error:', err);
    }
  };

  const signOut = async () => {
    try {
      await signOutMutation();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
      setHasToken(false);
    }
  };

  // Calculate loading state: loading if we're initializing or if we have a token and are checking it
  // If no token and not initializing, we're not loading (show SignIn immediately)
  const hasTokenNow = typeof window !== 'undefined' ? !!localStorage.getItem('auth_token') : false;
  const isActuallyLoading = isInitializing || (hasTokenNow && isLoading);

  const value = {
    user,
    isAuthenticated: !!user && hasTokenNow, // Can't be authenticated without a token
    isLoading: isActuallyLoading,
    signIn,
    signOut,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
