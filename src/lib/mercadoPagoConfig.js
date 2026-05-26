// Configuração do Mercado Pago
// Nota: A chave pública será usada no frontend
// A chave privada será usada no backend (se necessário)

export const MERCADO_PAGO_PUBLIC_KEY = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY || 'APP_USR-YOUR_PUBLIC_KEY_HERE';

// Planos de assinatura
export const SUBSCRIPTION_PLANS = {
  SOLO_MENSAL: {
    id: 'solo_mensal',
    name: 'Plano Solo - Mensal',
    type: 'solo',
    period: 'mensal',
    price: 27.00,
    currency: 'BRL',
    description: 'Acesso ao app com plano alimentar personalizado'
  },
  SOLO_TRIMESTRAL: {
    id: 'solo_trimestral',
    name: 'Plano Solo - Trimestral',
    type: 'solo',
    period: 'trimestral',
    price: 67.00,
    currency: 'BRL',
    description: 'Acesso ao app com plano alimentar personalizado - 3 meses',
    featured: true,
    durationDays: 90
  },
  SOLO_SEMESTRAL: {
    id: 'solo_semestral',
    name: 'Plano Solo - Semestral',
    type: 'solo',
    period: 'semestral',
    price: 117.00,
    currency: 'BRL',
    description: 'Acesso ao app com plano alimentar personalizado - 6 meses',
    durationDays: 180
  },
  ACOMPANHADO_MENSAL: {
    id: 'acompanhado_mensal',
    name: 'Plano Acompanhado - Mensal',
    type: 'acompanhado',
    period: 'mensal',
    price: 297.00,
    currency: 'BRL',
    description: 'Acesso ao app com acompanhamento personalizado da nutricionista'
  },
  ACOMPANHADO_TRIMESTRAL: {
    id: 'acompanhado_trimestral',
    name: 'Plano Acompanhado - Trimestral',
    type: 'acompanhado',
    period: 'trimestral',
    price: 747.00,
    currency: 'BRL',
    description: 'Acesso ao app com acompanhamento personalizado da nutricionista - 3 meses',
    featured: true,
    durationDays: 90
  },
  ACOMPANHADO_SEMESTRAL: {
    id: 'acompanhado_semestral',
    name: 'Plano Acompanhado - Semestral',
    type: 'acompanhado',
    period: 'semestral',
    price: 1347.00,
    currency: 'BRL',
    description: 'Acesso ao app com acompanhamento personalizado da nutricionista - 6 meses',
    durationDays: 180
  }
};

// Benefícios por tipo de plano
export const PLAN_BENEFITS = {
  solo: [
    'Plano alimentar personalizado',
    'Histórico de diário alimentar',
    'Cálculo de água diária',
    'Checklist diário',
    'Biblioteca de receitas',
    'Acesso a conteúdos educativos'
  ],
  acompanhado: [
    'Tudo do plano Solo',
    'Consultas online com a nutri',
    'Compatibilidade DCC',
    'Plano alimentar personalizado',
    'Suporte via chat',
    'Agendamento de consultas',
    'Acesso à comunidade',
    'Jornada em email gamificada'
  ]
};

// Duração em dias para cada período
export const PERIOD_DAYS = {
  mensal: 30,
  trimestral: 90,
  semestral: 180
};

// Calcula a data de expiração da assinatura
export const calculateSubscriptionExpiry = (planId) => {
  const plan = SUBSCRIPTION_PLANS[planId];
  if (!plan) return null;
  
  const durationDays = plan.durationDays || PERIOD_DAYS[plan.period] || 30;
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + durationDays);
  
  return expiryDate;
};

// Formata o preço para exibição
export const formatPrice = (price) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
};
