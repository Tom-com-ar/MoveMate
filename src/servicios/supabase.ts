import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';

const urlSupabase = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const clavePublicaSupabase =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

export const supabaseConfigurado = Boolean(
  urlSupabase && clavePublicaSupabase,
);

export const supabase = supabaseConfigurado
  ? createClient(urlSupabase!, clavePublicaSupabase!, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: false,
        persistSession: false,
      },
    })
  : null;
