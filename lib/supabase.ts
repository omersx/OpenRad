
import { createClient } from '@supabase/supabase-js';

// Helper to validate that a string is a proper HTTP or HTTPS URL
function isValidHttpUrl(str: string): boolean {
    try {
        const url = new URL(str);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

// Helper to get a Supabase client instance
// Prioritizes localStorage config, falls back to env vars
export const getSupabaseClient = () => {
    let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (typeof window !== 'undefined') {
        try {
            const savedConfig = localStorage.getItem("openrad_config");
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                if (config.supabaseUrl && config.supabaseUrl.trim()) supabaseUrl = config.supabaseUrl.trim();
                if (config.supabaseAnonKey && config.supabaseAnonKey.trim()) supabaseAnonKey = config.supabaseAnonKey.trim();
            }
        } catch (e) {
            console.error("[OpenRad] Error reading Supabase config from localStorage:", e);
        }
    }

    // Only create client if both values are present AND the URL is a valid HTTP/HTTPS URL
    if (supabaseUrl && supabaseAnonKey && isValidHttpUrl(supabaseUrl)) {
        try {
            return createClient(supabaseUrl, supabaseAnonKey);
        } catch (e) {
            console.error("[OpenRad] Failed to create Supabase client:", e);
            return null;
        }
    }

    return null;
};
