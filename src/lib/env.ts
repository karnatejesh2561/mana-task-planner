import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '@env';

const normalize = (value?: string) => value?.trim() || '';

export const getSupabaseConfig = () => {
  const url = normalize(SUPABASE_URL);
  const publishableKey = normalize(SUPABASE_PUBLISHABLE_KEY);
  const isConfigured = Boolean(url && publishableKey && !url.includes('your-project-ref'));

  return {
    url,
    publishableKey,
    isConfigured,
  };
};
