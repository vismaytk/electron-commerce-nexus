
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

  // Set up auth state listener and check for existing session
  useEffect(() => {
    console.log("Setting up auth state listener");
    
    // Set up auth state listener FIRST to prevent missing auth events during initialization
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (session?.user) {
        console.log("User in session, fetching profile data");
        try {
          const { data, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error('Error fetching user profile:', profileError);
            return;
          }
          
          if (data) {
            console.log("Profile data fetched successfully");
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: data.name || '',
              isAdmin: data.is_admin || false,
            });
          }
        } catch (error) {
          console.error('Error in auth state change handler:', error);
        }
      } else {
        console.log("No user in session, clearing user state");
        setUser(null);
      }
      
      setIsLoading(false);
    });
    
    // THEN check for existing session
    const checkSession = async () => {
      try {
        console.log("Checking for existing session");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session?.user) {
          console.log("Existing session found, fetching profile data");
          const { data, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            throw profileError;
          }
          
          if (data) {
            console.log("Profile data fetched for existing session");
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: data.name || '',
              isAdmin: data.is_admin || false,
            });
          }
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Clean up subscription on unmount
    return () => {
      console.log("Cleaning up auth state subscription");
      subscription.unsubscribe();
    };
  }, []);
  
  const login = async (email: string, password: string) => {
    console.log("Login attempt:", email);
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error("Login error:", error);
        throw error;
      }
      
      if (data.user) {
        console.log("Login successful, fetching profile");
        // Immediately update user data after login
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile after login:", profileError);
        } else if (profileData) {
          console.log("Setting user data after login");
          setUser({
            id: data.user.id,
            email: data.user.email || '',
            name: profileData.name || '',
            isAdmin: profileData.is_admin || false,
          });
        }
      }
      
      toast.success('Logged in successfully!');
      return data;
    } catch (error: any) {
      console.error("Login processing error:", error);
      toast.error(`Login failed: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const signup = async (email: string, password: string, name: string) => {
    console.log("Signup attempt:", email);
    setIsLoading(true);
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }
      
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
        console.error("Signup error:", error);
        throw error;
      }
      
      // Note: We do not set user here since onAuthStateChange will handle it
      // or login after signup should handle it
      
      toast.success('Account created successfully!');
      return data;
    } catch (error: any) {
      console.error("Signup processing error:", error);
      toast.error(`Signup failed: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    console.log("Logout attempt");
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        throw error;
      }
      
      setUser(null);
      toast.success('Logged out successfully!');
    } catch (error: any) {
      console.error("Logout processing error:", error);
      toast.error(`Logout failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout }}>
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
