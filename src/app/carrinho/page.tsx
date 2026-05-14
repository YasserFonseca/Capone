import { redirect } from 'next/navigation';

// Cart flow was replaced by direct Mercado Pago checkout
export default function CarrinhoPage() {
  redirect('/servicos');
}
