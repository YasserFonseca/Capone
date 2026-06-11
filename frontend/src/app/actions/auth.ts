'use server';

import { RegisterSchema, LoginSchema } from '@/lib/security';

export interface ActionResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

/**
 * Ação de servidor para registrar usuários com blindagem de inputs e banco de dados.
 */
export async function registerUser(formData: { name: string; email: string; password: string }) {
  // Simulação de latência de rede/segurança
  await new Promise((resolve) => setTimeout(resolve, 300));

  // 1. Validação estrita no lado do Servidor com Zod
  const result = RegisterSchema.safeParse(formData);

  if (!result.success) {
    const formattedErrors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      if (issue.path[0]) {
        formattedErrors[issue.path[0].toString()] = issue.message;
      }
    });
    
    return {
      success: false,
      message: 'Falha na validação de segurança do servidor.',
      errors: formattedErrors,
    };
  }

  // 2. Os dados de retorno de `result.data` já estão limpos, normalizados no padrão Unicode NFC,
  // sem null-bytes e truncados nos limites exatos do VARCHAR correspondente no Banco de Dados.
  const { name, email } = result.data;

  // Simulação de gravação no banco de dados. 
  // Em produção, isso usaria queries parametrizadas (ex: `INSERT INTO users (name, email) VALUES ($1, $2)`)
  console.log(`[Database Shield] Salvando usuário blindado: Name="${name}" Email="${email}"`);

  return {
    success: true,
    message: 'Usuário registrado com sucesso!',
  };
}

/**
 * Ação de servidor para login com sanitização de credenciais.
 */
export async function loginUser(formData: { email: string; password: string }) {
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Validação estrita
  const result = LoginSchema.safeParse(formData);

  if (!result.success) {
    const formattedErrors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      if (issue.path[0]) {
        formattedErrors[issue.path[0].toString()] = issue.message;
      }
    });

    return {
      success: false,
      message: 'Credenciais com formato inválido ou suspeito.',
      errors: formattedErrors,
    };
  }

  const { email } = result.data;
  console.log(`[Database Shield] Login autenticado de forma segura para: Email="${email}"`);

  return {
    success: true,
    message: 'Login efetuado com sucesso!',
  };
}
