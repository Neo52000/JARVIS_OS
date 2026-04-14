import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kugxxbnwfmieimgcihhd.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_pF4W9Z55qDOS61MeP4Facw_krY_DOvq';

export const supabase = createClient(supabaseUrl, supabaseKey);
