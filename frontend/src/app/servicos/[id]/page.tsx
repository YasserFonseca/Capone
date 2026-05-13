'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './Form.module.css';
import { ShoppingCart, CheckCircle, Clock, Smartphone, Settings } from 'lucide-react';
import { ReactNode } from 'react';

interface Feature {
  title: string;
  desc: string;
  icon: ReactNode;
}

interface ServiceData {
  title: string;
  subtitle: string;
  features: Feature[];
}

const serviceData: Record<string, ServiceData> = {
  odontologia: {
    title: 'Clínica de Odontologia',
    subtitle: 'Acabe com as faltas não avisadas e automatize a confirmação das consultas via WhatsApp.',
    features: [
      { title: 'Agendamento 24/7', desc: 'Permita que seus pacientes agendem a qualquer momento, sem precisar de intervenção humana.', icon: <Clock /> },
      { title: 'Lembretes Inteligentes', desc: 'Envio automático de WhatsApp 24h antes da consulta pedindo confirmação.', icon: <Smartphone /> },
      { title: 'Gestão Descomplicada', desc: 'Sincronização com o painel do dentista, organizando toda a agenda do dia.', icon: <Settings /> }
    ]
  },
  barbearia: {
    title: 'Barbearia',
    subtitle: 'Não perca mais tempo no WhatsApp tentando marcar horários. A IA faz isso por você.',
    features: [
      { title: 'Controle de Profissionais', desc: 'O cliente escolhe o barbeiro favorito e a IA verifica a disponibilidade real.', icon: <Clock /> },
      { title: 'Retorno Automático', desc: 'Avisos automáticos após 20 dias sugerindo um novo corte.', icon: <Smartphone /> },
      { title: 'Pagamento Facilitado', desc: 'Integração para pagamento antecipado ou envio de link de PIX.', icon: <Settings /> }
    ]
  },
  petshop: {
    title: 'Pet Shop',
    subtitle: 'Tranquilidade para os donos e organização impecável para o seu banho e tosa.',
    features: [
      { title: 'Avisos de Finalização', desc: 'Notifique automaticamente o dono assim que o pet estiver pronto.', icon: <Smartphone /> },
      { title: 'Histórico Completo', desc: 'A IA lembra da raça, tamanho e preferências do pet.', icon: <Settings /> },
      { title: 'Recorrência de Vacinas', desc: 'Lembretes anuais para vacinação e check-ups veterinários.', icon: <Clock /> }
    ]
  },
  advocacia: {
    title: 'Clínica de Advocacia',
    subtitle: 'Triagem inteligente e recepção jurídica automatizada com máxima discrição.',
    features: [
      { title: 'Triagem de Casos', desc: 'O bot coleta as informações iniciais e documentos antes da reunião.', icon: <Settings /> },
      { title: 'Agendamento Seguro', desc: 'Geração de links para videoconferência ou reuniões presenciais.', icon: <Clock /> },
      { title: 'Lembretes de Prazos', desc: 'Avisa o cliente sobre atualizações do processo automaticamente.', icon: <Smartphone /> }
    ]
  },
  psicologia: {
    title: 'Clínica de Psicologia',
    subtitle: 'Acolhimento automatizado e organização financeira para seus pacientes.',
    features: [
      { title: 'Cobrança Discreta', desc: 'Envio de links de pagamento e lembretes financeiros de forma leve.', icon: <Settings /> },
      { title: 'Agenda Rotativa', desc: 'Gestão inteligente de encaixes caso haja alguma desistência.', icon: <Clock /> },
      { title: 'Mensagens de Acolhimento', desc: 'Comunicação empática antes e depois das sessões.', icon: <Smartphone /> }
    ]
  }
};

export default function ServicoForm({ params }: { params: { id: string } }) {
  const { addToCart, showToast, openCart } = useCart();
  const [formData, setFormData] = useState({
    nome_empresa: '',
    horario: '',
    telefone: '',
    servicos: '',
    endereco: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isFormValid = Object.values(formData).every(value => value.trim() !== '');

  const data = serviceData[params.id] || {
    title: 'Serviço Personalizado',
    subtitle: 'Automação sob medida para o seu negócio.',
    features: [
      { title: 'Integração Customizada', desc: 'Nosso sistema se adapta perfeitamente ao seu modelo.', icon: <Settings /> }
    ]
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      addToCart({
        id: params.id,
        title: data.title,
        price: 149.90, // default price
        formData: formData
      });
      showToast('Inteligência Artificial adicionada ao carrinho!');
      openCart(); // Opens the Side Drawer
    }
  };

  return (
    <>
      <Header />
      <main style={{ paddingTop: '80px', minHeight: '80vh' }}>
        
        <section className={styles.hero}>
          <h1 className={`${styles.heroTitle} gradient-text fade-in`}>{data.title}</h1>
          <p className={`${styles.heroSubtitle} fade-in`} style={{ animationDelay: '0.1s' }}>
            {data.subtitle}
          </p>
        </section>

        <section className={styles.mainContent}>
          <div className={`${styles.infoSection} fade-in`} style={{ animationDelay: '0.2s' }}>
            <h2>Como a IA vai transformar seu negócio</h2>
            <div className={styles.featureList}>
              {data.features.map((feat: Feature, idx: number) => (
                <div key={idx} className={styles.featureItem}>
                  <div className={styles.featureIcon}>{feat.icon}</div>
                  <div className={styles.featureText}>
                    <h3>{feat.title}</h3>
                    <p>{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'rgba(45, 106, 79, 0.1)', border: '1px solid var(--success)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--success)', fontWeight: 'bold' }}>
                <CheckCircle size={20} /> Setup Incluso
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>A configuração inicial e o treinamento da inteligência artificial são feitos pela nossa equipe sem custos adicionais. Basta preencher as informações ao lado.</p>
            </div>
          </div>

          <div className={`${styles.formSection} fade-in`} style={{ animationDelay: '0.3s' }}>
            <h3>Configure sua Automação</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
              Precisamos dessas informações vitais para parametrizar seu bot.
            </p>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="nome_empresa">Nome da Empresa</label>
                <input type="text" id="nome_empresa" name="nome_empresa" className={styles.input} value={formData.nome_empresa} onChange={handleChange} placeholder="Ex: Consultório Dr. João" required />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="horario">Horário de Funcionamento</label>
                <input type="text" id="horario" name="horario" className={styles.input} value={formData.horario} onChange={handleChange} placeholder="Ex: Seg a Sex das 08h às 18h" required />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="telefone">Telefone / WhatsApp Comercial</label>
                <input type="text" id="telefone" name="telefone" className={styles.input} value={formData.telefone} onChange={handleChange} placeholder="Ex: (11) 99999-9999" required />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="endereco">Endereço Completo</label>
                <input type="text" id="endereco" name="endereco" className={styles.input} value={formData.endereco} onChange={handleChange} placeholder="Ex: Rua das Flores, 123 - Centro" required />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="servicos">Serviços Oferecidos (Descreva)</label>
                <textarea id="servicos" name="servicos" className={styles.textarea} value={formData.servicos} onChange={handleChange} placeholder="Ex: Limpeza, clareamento, extração..." required />
              </div>

              <button type="submit" className={styles.submitBtn} disabled={!isFormValid}>
                Adicionar ao Carrinho
                <ShoppingCart size={20} />
              </button>
              {!isFormValid && (
                <span className={styles.errorText} style={{ textAlign: 'center' }}>
                  Preencha todos os campos para continuar.
                </span>
              )}
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
