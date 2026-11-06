import { createClient, SupabaseAuthAdapter } from '@neondatabase/neon-js';

const authUrl = import.meta.env.VITE_NEON_AUTH_URL;
const dataApiUrl = import.meta.env.VITE_NEON_DATA_API_URL;

if (!authUrl || !dataApiUrl) {
  console.warn('Neon credentials not found. Please set VITE_NEON_AUTH_URL and VITE_NEON_DATA_API_URL in your .env file.');
}

/**
 * Neon client: Neon Auth for sign-in, and the Data API (PostgREST-compatible) for
 * queries. The signed-in user's JWT is attached to every query automatically, and the
 * database's RLS policies restrict rows to the owner.
 *
 * SupabaseAuthAdapter exposes the same auth API the app used with supabase-js
 * (signInWithPassword, getSession, onAuthStateChange, signOut).
 */
export const db = createClient({
  auth: {
    adapter: SupabaseAuthAdapter(),
    url: authUrl || 'http://localhost/auth',
  },
  dataApi: {
    url: dataApiUrl || 'http://localhost/rest/v1',
  },
});
