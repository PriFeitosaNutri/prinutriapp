# Configuração do Mercado Pago - PriNutriApp

## 📋 Visão Geral

Este documento descreve como configurar a integração com o Mercado Pago para o sistema de pagamento de planos do PriNutriApp.

## 🔧 Configuração do Frontend

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-sua_chave_publica_aqui
VITE_API_URL=http://localhost:5173
```

### 2. Obter Chaves do Mercado Pago

1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Faça login ou crie uma conta
3. Vá para "Credenciais" e copie sua **Chave Pública** (Public Key)
4. Guarde a **Chave de Acesso** (Access Token) para o backend

## 🚀 Configuração do Backend

### Requisitos

Para funcionar completamente, você precisa de um backend que:

1. **Crie preferências de pagamento** no Mercado Pago
2. **Processe webhooks** para confirmar pagamentos
3. **Atualize o banco de dados** quando o pagamento for confirmado

### Exemplo com Node.js/Express

```javascript
// backend/routes/mercado-pago.js
import express from 'express';
import mercadopago from 'mercadopago';

const router = express.Router();

// Configurar credenciais do Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN
});

// Criar preferência de pagamento
router.post('/create-mercado-pago-preference', async (req, res) => {
  try {
    const preference = {
      items: req.body.items,
      payer: req.body.payer,
      back_urls: req.body.back_urls,
      auto_return: 'approved',
      external_reference: req.body.external_reference,
      notification_url: `${process.env.API_URL}/api/mercado-pago-webhook`,
      metadata: req.body.metadata
    };

    const response = await mercadopago.preferences.create(preference);
    
    res.json({
      init_point: response.body.init_point,
      id: response.body.id
    });
  } catch (error) {
    console.error('Erro ao criar preferência:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook para confirmar pagamento
router.post('/mercado-pago-webhook', async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === 'payment') {
      const paymentId = data.id;
      
      // Buscar detalhes do pagamento
      const payment = await mercadopago.payment.findById(paymentId);
      
      if (payment.body.status === 'approved') {
        const { external_reference, metadata } = payment.body;
        
        // Atualizar banco de dados (Supabase)
        // Implementar lógica de atualização do perfil do usuário
        console.log('Pagamento confirmado:', external_reference);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

### Variáveis de Ambiente do Backend

```env
MERCADO_PAGO_ACCESS_TOKEN=seu_access_token_aqui
API_URL=https://seu-dominio.com
```

## 📊 Fluxo de Pagamento

```
1. Paciente acessa prinutriapp.com.br
   ↓
2. Clica em "Quero esse" em um plano
   ↓
3. Vê resumo do pedido
   ↓
4. Clica em "Ir para pagamento"
   ↓
5. Redireciona para Mercado Pago
   ↓
6. Completa o pagamento
   ↓
7. Retorna ao app (URL: ?payment_status=approved&plan_id=solo_trimestral)
   ↓
8. App detecta sucesso e atualiza perfil
   ↓
9. Paciente segue para Anamnese
```

## 🔐 Segurança

### Boas Práticas

1. **Nunca exponha sua Chave de Acesso** no frontend
2. **Sempre valide pagamentos no backend** antes de liberar acesso
3. **Use HTTPS** em produção
4. **Implemente rate limiting** nos endpoints de webhook
5. **Valide assinaturas de webhook** do Mercado Pago

### Validação de Webhook

```javascript
// Validar assinatura do webhook
const validateWebhookSignature = (req, secret) => {
  const signature = req.headers['x-signature'];
  const timestamp = req.headers['x-timestamp'];
  
  // Implementar validação de HMAC-SHA256
  // Referência: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/your-integrations/webhooks
};
```

## 📱 Campos do Perfil Atualizados

Quando um pagamento é confirmado, os seguintes campos são atualizados:

```javascript
{
  plan_type: 'solo' | 'acompanhado',
  subscription_expires_at: '2026-08-24T00:00:00Z',
  payment_method: 'mercado_pago' | 'presencial',
  has_paid: true
}
```

## 🧪 Testes

### Modo Sandbox

O Mercado Pago oferece um ambiente de testes. Use:

- **Chave Pública de Teste**: Disponível no painel do desenvolvedor
- **Cartões de Teste**: Consulte a documentação do Mercado Pago

### Fluxo de Teste

1. Use a chave pública de teste
2. Complete o pagamento com um cartão de teste
3. Verifique se o webhook foi acionado
4. Confirme que o perfil foi atualizado no banco de dados

## 📞 Suporte

Para dúvidas sobre a integração:

- [Documentação do Mercado Pago](https://www.mercadopago.com.br/developers)
- [Fórum de Desenvolvedores](https://forum.mercadopago.com/)

## ✅ Checklist de Implementação

- [ ] Chaves do Mercado Pago configuradas
- [ ] Backend implementado com criação de preferências
- [ ] Webhook configurado e testado
- [ ] Validação de assinatura de webhook implementada
- [ ] Banco de dados atualizado com novos campos
- [ ] Testes em ambiente sandbox concluídos
- [ ] Deploy em produção realizado
- [ ] Monitoramento de pagamentos configurado
