import { supabase } from './supabase';

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function requireAdmin(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  return session.user.user_metadata?.is_admin === true;
}
