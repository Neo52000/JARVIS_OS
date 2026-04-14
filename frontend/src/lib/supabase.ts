import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vltumfumxnzsctsoxvph.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsdHVtZnVteG56c2N0c294dnBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NTUyNDcsImV4cCI6MjA4MTAzMTI0N30.WIgG_dS7dCBmRJLRxpk2oqNEZ76_nWpO2RHC0Tp8HB4';

export const supabase = createClient(supabaseUrl, supabaseKey);
