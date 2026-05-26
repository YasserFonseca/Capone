// Usa a service_role key — bypassa RLS.
// NUNCA importar em Client Components.
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || 'https://placeholder-for-build-safety.supabase.co'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-for-build-safety-key'

export const supabaseAdmin = createClient(
  url,
  key,
  { auth: { autoRefreshToken: false, persistSession: false } }
)


