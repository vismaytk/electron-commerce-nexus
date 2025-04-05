
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Use hardcoded values since we're in a development environment
// In a production environment, these would be environment variables
const supabaseUrl = 'https://okcbbbjaaytjeslqpbou.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rY2JiYmphYXl0amVzbHFwYm91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3NDU5NTUsImV4cCI6MjA1OTMyMTk1NX0.WfKD705sSLec0alQd4mo_G54WlH_-P3NhrahiKylhqY';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export default supabase;
