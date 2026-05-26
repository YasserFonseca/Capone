// lib/supabase.ts — Cliente Supabase para o frontend (anon key + RLS)
// Usa createBrowserClient do @supabase/ssr para armazenar sessão em cookies,
// permitindo que o servidor leia a sessão via createServerClient.
import { createBrowserClient } from '@supabase/ssr'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-for-build-safety.supabase.co'
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-for-build-safety-key'

export const supabase = createBrowserClient(url, key)

