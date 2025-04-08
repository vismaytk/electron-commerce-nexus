
import { useState, useEffect } from 'react';
import { User } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
}

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Set up auth state listener and check for existing session
  useEffect(() => {
    console.log("Setting up auth state listener");
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      
      if (session?.user) {
        // Defer Supabase calls with setTimeout to prevent potential deadlocks
        setTimeout(async () => {
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
          } finally {
            setIsLoading(false);
          }
        }, 0);
      } else {
        console.log("No user in session, clearing user state");
        setUser(null);
        setIsLoading(false);
      }
    });
    
    // Check for existing session
    const checkSession = async () => {
      try {
        console.log("Checking for existing session");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          setIsLoading(false);
          return;
        }
        
        if (!session) {
          console.log("No existing session found");
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log("Login attempt:", email);
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error("Login error:", error);
        toast.error(`Login failed: ${error.message}`);
        throw error;
      }
      
      toast.success('Logged in successfully!');
      return data;
    } finally {
      setIsLoading(false);
    }
  };
  
  const signup = async (email: string, password: string, name: string) => {
    try {
      console.log("Signup attempt:", email);
      setIsLoading(true);
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error('Please enter a valid email address');
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
        toast.error(`Signup failed: ${error.message}`);
        throw error;
      }
      
      toast.success('Account created successfully!');
      return data;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      console.log("Logout attempt");
      setIsLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        toast.error(`Logout failed: ${error.message}`);
        throw error;
      }
      
      setUser(null);
      toast.success('Logged out successfully!');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    login,
    signup,
    logout
  };
};
