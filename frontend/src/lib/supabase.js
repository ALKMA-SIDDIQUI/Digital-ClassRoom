import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  !supabaseUrl.includes("your-project-id")
);

if (!isSupabaseConfigured) {
  console.warn(
    "[Supabase Warning] VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are missing or set to placeholders in frontend/.env. " +
    "Authentication UI is available, but authentication requests will require real Supabase project credentials."
  );
}

// Create a singleton Supabase client with persistent localStorage sessions
export const supabase = createClient(
  supabaseUrl || "https://placeholder-project.supabase.co",
  supabaseKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
    },
  }
);
