import { supabase, isSupabaseConfigured } from './supabaseClient';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL !== undefined 
  ? import.meta.env.VITE_BACKEND_URL 
  : (import.meta.env.DEV ? 'http://localhost:5000' : '');

export async function fetchWithAuth(endpoint, options = {}, currentRole = 'candidate') {
  let token = null;

  if (isSupabaseConfigured()) {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token;
  }

  // Fallback demo token if live Supabase session isn't available
  if (!token) {
    token = `demo-token-${currentRole}`;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(options.headers || {})
  };

  try {
    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
      ...options,
      headers
    });

    const contentType = res.headers.get('content-type') || '';
    let data;

    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const textData = await res.text();
      console.warn(`Non-JSON response from ${endpoint}:`, textData.substring(0, 100));
      data = { success: res.ok, message: `Response status ${res.status}` };
    }

    if (!res.ok) {
      throw new Error(data.message || `API Error (${res.status})`);
    }

    return data;
  } catch (err) {
    console.error(`Fetch error for ${endpoint}:`, err.message);
    throw err;
  }
}
