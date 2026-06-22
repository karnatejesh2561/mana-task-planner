import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import { getSupabaseConfig } from './env';

const { url, publishableKey, isConfigured } = getSupabaseConfig();

export const supabase = isConfigured
  ? createClient(url, publishableKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export const assertSupabaseConfigured = () => {
  if (!supabase) {
    throw new Error('Supabase configuration missing. Add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY to your local environment file.');
  }

  return supabase;
};
