const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const isSupabaseConfigured = Boolean(supabaseUrl && (supabaseSecretKey || supabaseAnonKey));

if (!isSupabaseConfigured) {
  console.warn(
    "[Supabase Warning] SUPABASE_URL and SUPABASE_SECRET_KEY/SUPABASE_ANON_KEY are not fully configured in your .env file. " +
    "Database persistence and authentication verification will run in unconfigured/fallback mode until credentials are provided."
  );
}

// Admin client for backend operations, user profile lookups, role enforcement, and token validation
const supabaseAdmin = supabaseUrl && (supabaseSecretKey || supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseSecretKey || supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Anon client for public/user scoped interactions if needed
const supabaseAnon = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

module.exports = {
  supabaseAdmin,
  supabaseAnon,
  isSupabaseConfigured,
};
