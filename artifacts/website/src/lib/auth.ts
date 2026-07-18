import { supabase } from './supabase';

export const signInWithDiscord = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: { redirectTo: window.location.origin }
  });
  return { data, error };
};

export const signOut = async () => supabase.auth.signOut();
export const getUser = async () => supabase.auth.getUser();
