'use server';

import { ContactSchema } from '@/lib/security';

export async function submitContactForm(formData: { name: string; email: string; message: string }) {
  // Simulação de latência de rede/segurança
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Validação estrita
  const result = ContactSchema.safeParse(formData);

  if (!result.success) {
    const formattedErrors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      if (issue.path[0]) {
        formattedErrors[issue.path[0].toString()] = issue.message;
      }
    });

    return {
      success: false,
      message: 'Dados inválidos ou suspeitos detectados.',
      errors: formattedErrors,
    };
  }

  const { name, email, message } = result.data;
  
  // Simulação de salvamento ou envio seguro. 
  // O input message foi limitado a 1000 caracteres e limpo de null-bytes e caracteres de quebra.
  console.log(`[Database Shield] Mensagem de contato sanitizada salva: De="${name}" <${email}> Msg="${message.substring(0, 50)}..."`);

  return {
    success: true,
    message: 'Mensagem enviada com sucesso!',
  };
}
