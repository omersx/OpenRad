
import { createClient } from '@supabase/supabase-js';

// Helper to get a Supabase client instance
// Prioritizes localStorage config, falls back to env vars
export const getSupabaseClient = () => {
    let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (typeof window !== 'undefined') {
        const savedConfig = localStorage.getItem("openrad_config");
        if (savedConfig) {
            const config = JSON.parse(savedConfig);
            if (config.supabaseUrl) supabaseUrl = config.supabaseUrl;
            if (config.supabaseAnonKey) supabaseAnonKey = config.supabaseAnonKey;
        }
    }

    if (supabaseUrl && supabaseAnonKey) {
        return createClient(supabaseUrl, supabaseAnonKey);
    }

    return null;
};
