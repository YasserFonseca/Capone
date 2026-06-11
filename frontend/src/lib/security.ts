import { z } from 'zod';

/**
 * Normaliza strings para evitar ataques de evasão usando caracteres multi-byte
 * ou sequências Unicode malformadas (Unicode Evasion).
 */
export function sanitizeString(input: string, maxLength: number): string {
  if (typeof input !== 'string') return '';
  
  // 1. Normaliza para a forma canônica NFC
  let normalized = input.normalize('NFC');
  
  // 2. Remove caracteres nulos (\u0000 / null bytes) frequentemente usados para quebrar strings no backend C/C++
  normalized = normalized.replace(/\0/g, '');
  
  // 3. Limita o tamanho máximo fisicamente para evitar estouro de buffer (buffer overflow)
  // ou estouro de limite de tabelas (VARCHAR column constraints) no banco de dados
  if (normalized.length > maxLength) {
    normalized = normalized.substring(0, maxLength);
  }
  
  return normalized;
}

/**
 * Escapa caracteres especiais que poderiam quebrar queries SQL dinâmicas,
 * fornecendo uma camada extra de proteção (embora queries parametrizadas sejam obrigatórias).
 */
export function escapeSqlString(input: string): string {
  return input.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
    switch (char) {
      case '\0': return '\\0';
      case '\x08': return '\\b';
      case '\x09': return '\\t';
      case '\x1a': return '\\z';
      case '\n': return '\\n';
      case '\r': return '\\r';
      case '"':
      case "'":
      case '\\':
      case '%':
        return '\\' + char; // Adiciona a barra de escape
      default:
        return char;
    }
  });
}

// ==========================================
// Schemas Zod de Validação (Camada de Contrato)
// ==========================================

// Validação de Cadastro (Registro)
export const RegisterSchema = z.object({
  name: z.string()
    .min(3, { message: 'O nome deve ter no mínimo 3 caracteres.' })
    .max(100, { message: 'O nome deve ter no máximo 100 caracteres.' })
    .transform((val) => sanitizeString(val, 100)),
    
  email: z.string()
    .email({ message: 'E-mail inválido.' })
    .max(100, { message: 'O e-mail deve ter no máximo 100 caracteres.' })
    .transform((val) => sanitizeString(val, 100).toLowerCase()),
    
  password: z.string()
    .min(8, { message: 'A senha deve ter no mínimo 8 caracteres.' })
    .max(50, { message: 'A senha deve ter no máximo 50 caracteres.' })
    // Não alteramos/escapamos a senha para evitar distorção do hash, mas limitamos o tamanho
    .refine((val) => {
      // Validação forte: Maiúscula, número, caractere especial
      const hasUpper = /[A-Z]/.test(val);
      const hasNumber = /[0-9]/.test(val);
      const hasSpecial = /[^A-Za-z0-9]/.test(val);
      return hasUpper && hasNumber && hasSpecial;
    }, { message: 'A senha não atende aos requisitos de complexidade.' })
});

// Validação de Login
export const LoginSchema = z.object({
  email: z.string()
    .email({ message: 'E-mail inválido.' })
    .max(100, { message: 'O e-mail deve ter no máximo 100 caracteres.' })
    .transform((val) => sanitizeString(val, 100).toLowerCase()),
    
  password: z.string()
    .min(1, { message: 'Senha é obrigatória.' })
    .max(50, { message: 'A senha deve ter no máximo 50 caracteres.' })
});

// Validação de Contato
export const ContactSchema = z.object({
  name: z.string()
    .min(2, { message: 'Nome inválido.' })
    .max(100, { message: 'Nome excede o limite.' })
    .transform((val) => sanitizeString(val, 100)),
    
  email: z.string()
    .email({ message: 'E-mail inválido.' })
    .max(100, { message: 'E-mail excede o limite.' })
    .transform((val) => sanitizeString(val, 100)),
    
  message: z.string()
    .min(5, { message: 'A mensagem deve ter pelo menos 5 caracteres.' })
    .max(1000, { message: 'A mensagem deve ter no máximo 1000 caracteres.' })
    .transform((val) => sanitizeString(val, 1000))
});
