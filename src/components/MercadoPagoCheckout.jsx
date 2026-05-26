import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { MERCADO_PAGO_PUBLIC_KEY, SUBSCRIPTION_PLANS, formatPrice } from '@/lib/mercadoPagoConfig';

const MercadoPagoCheckout = ({ plan, user, onPaymentSuccess, onCancel, loading = false }) => {
  const { toast } = useToast();
  const [checkoutReady, setCheckoutReady] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    // Carrega o script do Mercado Pago
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = () => {
      if (window.MercadoPago) {
        window.MercadoPago.setPublishableKey(MERCADO_PAGO_PUBLIC_KEY);
        setCheckoutReady(true);
      }
    };
    script.onerror = () => {
      console.error('Erro ao carregar SDK do Mercado Pago');
      toast({
        title: 'Erro ao carregar pagamento',
        description: 'Não foi possível carregar o sistema de pagamento. Tente novamente.',
        variant: 'destructive'
      });
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [toast]);

  const handlePayment = async () => {
    if (!checkoutReady || !window.MercadoPago) {
      toast({
        title: 'Sistema não pronto',
        description: 'Por favor, aguarde o carregamento do sistema de pagamento.',
        variant: 'destructive'
      });
      return;
    }

    setProcessingPayment(true);

    try {
      // Cria a preferência de pagamento
      const preference = {
        items: [
          {
            id: plan.id,
            title: plan.name,
            description: plan.description,
            picture_url: 'https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/ed36e7a1de1c406833a17d7982043f84.png',
            category_id: 'subscription',
            quantity: 1,
            unit_price: plan.price,
            currency_id: plan.currency
          }
        ],
        payer: {
          name: user?.name || 'Cliente',
          email: user?.email || '',
          phone: {
            area_code: '11',
            number: user?.phone || ''
          }
        },
        back_urls: {
          success: `${window.location.origin}?payment_status=approved&plan_id=${plan.id}`,
          failure: `${window.location.origin}?payment_status=failure&plan_id=${plan.id}`,
          pending: `${window.location.origin}?payment_status=pending&plan_id=${plan.id}`
        },
        auto_return: 'approved',
        external_reference: `${user?.id}_${plan.id}_${Date.now()}`,
        notification_url: `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/mercado-pago-webhook`,
        metadata: {
          user_id: user?.id,
          plan_type: plan.type,
          plan_period: plan.period
        }
      };

      // Faz a chamada para criar a preferência
      // Nota: Esta chamada deve ser feita do backend por segurança
      // Aqui estamos simulando o comportamento esperado
      const response = await fetch('/api/create-mercado-pago-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preference)
      });

      if (!response.ok) {
        throw new Error('Erro ao criar preferência de pagamento');
      }

      const data = await response.json();
      
      if (data.init_point) {
        // Redireciona para o checkout do Mercado Pago
        window.location.href = data.init_point;
      } else {
        throw new Error('Não foi possível obter o link de pagamento');
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast({
        title: 'Erro ao processar pagamento',
        description: error.message || 'Tente novamente mais tarde.',
        variant: 'destructive'
      });
      setProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        {/* Indicador de progresso */}
        <div className="flex justify-center items-center gap-2 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">1</div>
            <span className="text-sm text-muted-foreground">Escolher plano</span>
          </div>
          <div className="w-8 h-0.5 bg-muted"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
            <span className="text-sm text-muted-foreground">Pagamento</span>
          </div>
          <div className="w-8 h-0.5 bg-muted"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">3</div>
            <span className="text-sm text-muted-foreground">Anamnese</span>
          </div>
        </div>

        {/* Card de resumo */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Resumo do pedido</CardTitle>
            <CardDescription>Verifique os detalhes antes de confirmar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Plano selecionado */}
            <div className="border-b pb-4">
              <p className="text-sm text-muted-foreground mb-1">Plano selecionado</p>
              <p className="font-semibold text-foreground">{plan.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
            </div>

            {/* Preço */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Valor total:</span>
              <span className="text-2xl font-bold text-primary">R$ {plan.price.toFixed(2).replace('.', ',')}</span>
            </div>

            {/* Informação de segurança */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="text-xs text-green-800">
                <p className="font-semibold">Pagamento seguro</p>
                <p>Processado via Mercado Pago com criptografia SSL</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botões de ação */}
        <div className="space-y-3">
          <Button
            onClick={handlePayment}
            disabled={!checkoutReady || processingPayment || loading}
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
          >
            {processingPayment ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : !checkoutReady ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Carregando sistema de pagamento...
              </>
            ) : (
              'Ir para pagamento'
            )}
          </Button>

          <Button
            onClick={onCancel}
            disabled={processingPayment || loading}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Voltar
          </Button>
        </div>

        {/* Informação adicional */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Você será redirecionado para o Mercado Pago</p>
          <p>Após o pagamento confirmado, você continuará no app</p>
        </div>
      </div>
    </div>
  );
};

export default MercadoPagoCheckout;
