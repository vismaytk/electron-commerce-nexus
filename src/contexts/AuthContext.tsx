
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, name: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log('AuthProvider: Initializing auth state');
    const checkUser = async () => {
      try {
        console.log('AuthProvider: Checking user session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session?.user) {
          console.log('AuthProvider: Found existing session', session.user.id);
          const { data, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error('Error fetching user profile:', profileError);
            throw profileError;
          }
          
          if (data) {
            const userData = {
              id: session.user.id,
              email: session.user.email || '',
              name: data.name || '',
              isAdmin: data.is_admin || false,
            };
            console.log('AuthProvider: Setting user data', userData);
            setUser(userData);
          }
        } else {
          console.log('AuthProvider: No session found');
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUser();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      
      if (event === 'SIGNED_OUT') {
        console.log('User signed out, clearing user state');
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      if (session?.user) {
        try {
          console.log('Auth state change - fetching profile for user:', session.user.id);
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (error) {
            console.error('Error fetching user profile:', error);
            return;
          }
          
          if (data) {
            const userData = {
              id: session.user.id,
              email: session.user.email || '',
              name: data.name || '',
              isAdmin: data.is_admin || false,
            };
            console.log('Auth state change - setting user data:', userData);
            setUser(userData);
          }
        } catch (error) {
          console.error('Error in auth state change handler:', error);
        }
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const login = async (email: string, password: string) => {
    console.log('Login attempt for:', email);
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Login error:', error);
        throw error;
      }
      
      console.log('Login successful, data:', data);
      
      // Explicitly update user state here for immediate state change
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching profile after login:', profileError);
          throw profileError;
        }
          
        if (profileData) {
          const userData = {
            id: data.user.id,
            email: data.user.email || '',
            name: profileData.name || '',
            isAdmin: profileData.is_admin || false,
          };
          console.log('Setting user data after login:', userData);
          setUser(userData);
        }
      }
      
      toast.success('Logged in successfully!');
      return data;
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(`Login failed: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const signup = async (email: string, password: string, name: string) => {
    console.log('Signup attempt for:', email);
    setIsLoading(true);
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }
      
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (error) {
        console.error('Signup error:', error);
        throw error;
      }
      
      console.log('Signup successful, data:', data);
      
      // Immediately try to log in with the new credentials
      // This helps in development when email confirmation is off
      if (data && data.user) {
        try {
          console.log('Attempting auto-login after signup');
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ 
            email, 
            password 
          });
          
          if (loginError) {
            console.log('Auto-login after signup failed:', loginError);
          } else if (loginData && loginData.user) {
            console.log('Auto-login successful:', loginData.user.id);
            
            // Wait a moment for the profile to be created via trigger
            setTimeout(async () => {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', loginData.user!.id)
                .single();
                
              if (profileData) {
                const userData = {
                  id: loginData.user!.id,
                  email: loginData.user!.email || '',
                  name: profileData.name || '',
                  isAdmin: profileData.is_admin || false,
                };
                console.log('Setting user data after auto-login:', userData);
                setUser(userData);
              }
            }, 500);
          }
        } catch (loginError) {
          console.log('Auto-login after signup failed with exception:', loginError);
          // We don't need to throw this error as signup was successful
        }
      }
      
      toast.success('Account created successfully! Please check your email to confirm your account.');
      return data;
    } catch (error: any) {
      console.error('Signup failed:', error);
      toast.error(`Signup failed: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setUser(null);
      toast.success('Logged out successfully!');
    } catch (error: any) {
      toast.error(`Logout failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const contextValue = {
    user, 
    isAuthenticated: !!user, 
    isLoading, 
    login, 
    signup, 
    logout
  };

  console.log('AuthProvider current state:', { user, isAuthenticated: !!user, isLoading });
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
