// lib/supabase.ts — Cliente Supabase para o frontend (anon key + RLS)
// Usa createBrowserClient do @supabase/ssr para armazenar sessão em cookies,
// permitindo que o servidor leia a sessão via createServerClient.
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
