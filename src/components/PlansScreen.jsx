import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2 } from 'lucide-react';
import { SUBSCRIPTION_PLANS, PLAN_BENEFITS, formatPrice } from '@/lib/mercadoPagoConfig';

const PlansScreen = ({ user, onPlanSelected, loading = false }) => {
  const [selectedTab, setSelectedTab] = useState('solo');

  const plansToShow = {
    solo: [
      SUBSCRIPTION_PLANS.SOLO_MENSAL,
      SUBSCRIPTION_PLANS.SOLO_TRIMESTRAL,
      SUBSCRIPTION_PLANS.SOLO_SEMESTRAL
    ],
    acompanhado: [
      SUBSCRIPTION_PLANS.ACOMPANHADO_MENSAL,
      SUBSCRIPTION_PLANS.ACOMPANHADO_TRIMESTRAL,
      SUBSCRIPTION_PLANS.ACOMPANHADO_SEMESTRAL
    ]
  };

  const currentPlans = plansToShow[selectedTab];
  const benefits = PLAN_BENEFITS[selectedTab];

  const handleSelectPlan = (plan) => {
    if (onPlanSelected && !loading) {
      onPlanSelected(plan);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <img 
              alt="PriNutriApp Logo" 
              className="w-16 h-16 mx-auto mb-4" 
              src="https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/ed36e7a1de1c406833a17d7982043f84.png" 
            />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Planos PriNutri</h1>
          <p className="text-lg text-muted-foreground">Quanto mais tempo, maior o desconto</p>
        </div>

        {/* Indicador de progresso */}
        <div className="flex justify-center items-center gap-2 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
            <span className="text-sm text-muted-foreground">Escolher plano</span>
          </div>
          <div className="w-8 h-0.5 bg-muted"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">2</div>
            <span className="text-sm text-muted-foreground">Pagamento</span>
          </div>
          <div className="w-8 h-0.5 bg-muted"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">3</div>
            <span className="text-sm text-muted-foreground">Anamnese</span>
          </div>
        </div>

        {/* Tabs de seleção de tipo de plano */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-muted/50 p-1">
            <TabsTrigger value="solo" className="text-base">
              Plano Solo
            </TabsTrigger>
            <TabsTrigger value="acompanhado" className="text-base">
              Plano Acompanhado
            </TabsTrigger>
          </TabsList>

          {/* Conteúdo de cada tipo de plano */}
          <TabsContent value="solo" className="mt-8">
            <div className="grid md:grid-cols-3 gap-6">
              {currentPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  benefits={benefits}
                  onSelect={handleSelectPlan}
                  loading={loading}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="acompanhado" className="mt-8">
            <div className="grid md:grid-cols-3 gap-6">
              {currentPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  benefits={benefits}
                  onSelect={handleSelectPlan}
                  loading={loading}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer com informação */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>Pagamento seguro via Mercado Pago • Sem taxas ocultas • Cancelamento a qualquer momento</p>
        </div>
      </div>
    </div>
  );
};

const PlanCard = ({ plan, benefits, onSelect, loading }) => {
  const isFeatured = plan.featured;

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
      isFeatured ? 'ring-2 ring-primary md:scale-105' : ''
    }`}>
      {/* Badge de destaque */}
      {isFeatured && (
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-bl-lg">
          ⭐ Mais econômico
        </div>
      )}

      <CardHeader className={isFeatured ? 'bg-gradient-to-r from-primary/10 to-accent/10' : ''}>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{plan.period.charAt(0).toUpperCase() + plan.period.slice(1)}</CardTitle>
            <CardDescription className="text-xs mt-1">{plan.description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Preço */}
        <div className="mb-6">
          <div className="text-4xl font-bold text-primary">
            R$ {plan.price.toFixed(2).replace('.', ',')}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {plan.period === 'mensal' ? 'por mês' : plan.period === 'trimestral' ? 'por 3 meses' : 'por 6 meses'}
          </p>
        </div>

        {/* Benefícios */}
        <div className="space-y-3 mb-6">
          {benefits.slice(0, 4).map((benefit, index) => (
            <div key={index} className="flex items-start gap-3">
              <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm text-foreground">{benefit}</span>
            </div>
          ))}
          {benefits.length > 4 && (
            <div className="text-xs text-muted-foreground italic">
              + {benefits.length - 4} benefícios adicionais
            </div>
          )}
        </div>

        {/* Botão de seleção */}
        <Button
          onClick={() => onSelect(plan)}
          disabled={loading}
          className={`w-full ${isFeatured ? 'bg-primary hover:bg-primary/90' : ''}`}
          variant={isFeatured ? 'default' : 'outline'}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            'Quero esse'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PlansScreen;
