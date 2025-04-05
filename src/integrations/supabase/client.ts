
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Use hardcoded values since we're in a development environment
// In a production environment, these would be environment variables
const supabaseUrl = 'https://okcbbbjaaytjeslqpbou.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rY2JiYmphYXl0amVzbHFwYm91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3NDU5NTUsImV4cCI6MjA1OTMyMTk1NX0.WfKD705sSLec0alQd4mo_G54WlH_-P3NhrahiKylhqY';

// Create the Supabase client with custom fetch options to ensure better error handling
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    // Fix the TS error by correctly defining the fetch options
    headers: { 'x-app-version': '1.0.0' },
  },
});

// Helper function to handle edge function invocation with better error handling
export const invokeFunction = async (name: string, body?: any) => {
  try {
    const { data, error } = await supabase.functions.invoke(name, {
      body,
    });

    if (error) {
      console.error(`Error invoking function ${name}:`, error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Exception in function ${name}:`, error);
    return { data: null, error };
  }
};

export default supabase;
