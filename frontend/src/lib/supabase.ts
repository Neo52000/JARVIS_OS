import { createClient } from '@supabase/supabase-js';

// Fallbacks keep existing deploys working while VITE_SUPABASE_* are not yet set
// in Netlify. Once they are, these can be removed. The anon key is public by
// design; data isolation relies on RLS (see supabase/migrations/).
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set — using built-in fallback project.');
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tvpmyzxopxvoiyxgngeh.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2cG15enhvcHh2b2l5eGduZ2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNzY5MTAsImV4cCI6MjA5MTc1MjkxMH0.mp6N7jGuyHbunwfToV9LuUqoEpVxErguJXqfcQOmiEA';

export const supabase = createClient(supabaseUrl, supabaseKey);
