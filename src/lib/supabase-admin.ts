// Usa a service_role key — bypassa RLS.
// NUNCA importar em Client Components.
import { createClient } from '@supabase/supabase-js'

if (!process.env.SUPABASE_URL)              throw new Error('SUPABASE_URL não definida')
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY não definida')

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)
