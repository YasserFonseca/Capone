/**
 * Cria a conta de administrador no Supabase.
 * Uso: node scripts/create-admin.mjs <SERVICE_ROLE_KEY>
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ucfnhmpilohwkdjibczs.supabase.co';
const SERVICE_ROLE_KEY = process.argv[2];

if (!SERVICE_ROLE_KEY) {
  console.error('❌  Passe a service_role key como argumento:');
  console.error('   node scripts/create-admin.mjs <SERVICE_ROLE_KEY>');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ADMIN = {
  email:     'admin@capone.com.br',
  password:  'Capone@Admin2025!',
  full_name: 'Administrador Capone',
  cpf_cnpj:  '00000000000',   // CPF fictício só para admin interno
  is_admin:  true,
};

async function main() {
  console.log('Criando conta de admin...');

  const { data, error } = await supabase.auth.admin.createUser({
    email:              ADMIN.email,
    password:           ADMIN.password,
    email_confirm:      true,          // pula verificação de e-mail
    user_metadata: {
      full_name: ADMIN.full_name,
      cpf_cnpj:  ADMIN.cpf_cnpj,
      is_admin:  ADMIN.is_admin,
    },
  });

  if (error) {
    console.error('❌  Erro ao criar usuário:', error.message);
    process.exit(1);
  }

  console.log('✅  Conta criada com sucesso!');
  console.log('');
  console.log('  E-mail  :', ADMIN.email);
  console.log('  Senha   :', ADMIN.password);
  console.log('  UUID    :', data.user.id);
  console.log('  Admin   :', ADMIN.is_admin);
  console.log('');
  console.log('Salve essas informações em local seguro.');
}

main();
