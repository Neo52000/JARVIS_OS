import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tvpmyzxopxvoiyxgngeh.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2cG15enhvcHh2b2l5eGduZ2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNzY5MTAsImV4cCI6MjA5MTc1MjkxMH0.mp6N7jGuyHbunwfToV9LuUqoEpVxErguJXqfcQOmiEA';

export const supabase = createClient(supabaseUrl, supabaseKey);
