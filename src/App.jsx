import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import LoginForm from '@/components/LoginForm';
import PlansScreen from '@/components/PlansScreen';
import MercadoPagoCheckout from '@/components/MercadoPagoCheckout';
import WelcomeScreen from '@/components/WelcomeScreen';
import AnamnesisForm from '@/components/AnamnesisForm';
import SchedulingScreen from '@/components/SchedulingScreen';
import PostSchedulingWaitScreen from '@/components/PostSchedulingWaitScreen';
import Dashboard from '@/components/Dashboard';
import AdminDashboard from '@/components/admin/AdminDashboard';
import NewsScreen from '@/components/NewsScreen';
import AdminNewsScreen from '@/components/admin/AdminNewsScreen';
import PrivacyPolicy from '@/components/PrivacyPolicy';
import ErrorScreen from '@/components/ErrorScreen';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAppScreenLogic } from '@/hooks/useAppScreenLogic';
import { updateProfile as dbUpdateProfile } from '@/lib/database';
import { calculateSubscriptionExpiry } from '@/lib/mercadoPagoConfig';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorScreen error={this.state.error} errorInfo={this.state.errorInfo} onContact={() => this.setState({ hasError: false, error: null, errorInfo: null })} />;
    }
    return this.props.children;
  }
}

function App() {
  const {
    user,
    isAdmin,
    loading,
    signOut: handleLogout,
    session,
    profile,
    updateProfile,
  } = useAuth();
  
  const { toast } = useToast();
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    document.title = "PriNutriApp";
    const beforeInstallPromptHandler = (e) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", beforeInstallPromptHandler);
    
    // Verifica se voltou do pagamento do Mercado Pago
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment_status');
    const planId = params.get('plan_id');
    
    if (paymentStatus === 'approved' && planId && profile) {
      handlePaymentSuccess(planId);
      // Limpa a URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    return () => window.removeEventListener("beforeinstallprompt", beforeInstallPromptHandler);
  }, [profile]);

  const handleInstallClick = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      toast({ title: outcome === 'accepted' ? "Instalado! 🎉" : "Instalação cancelada" });
      setDeferredInstallPrompt(null);
    }
  };

  const handlePlanSelected = (plan) => {
    setSelectedPlan(plan);
  };

  const handlePaymentSuccess = async (planId) => {
    try {
      setProcessingPayment(true);
      const expiryDate = calculateSubscriptionExpiry(planId);
      const planType = planId.includes('solo') ? 'solo' : 'acompanhado';
      
      await dbUpdateProfile(profile.id, {
        plan_type: planType,
        subscription_expires_at: expiryDate.toISOString(),
        payment_method: 'mercado_pago',
        has_paid: true
      });
      
      await updateProfile(profile.id);
      setSelectedPlan(null);
      
      toast({
        title: "Pagamento confirmado! 🎉",
        description: "Bem-vindo ao PriNutriApp. Vamos começar com algumas perguntas importantes."
      });
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast({
        title: "Erro ao processar pagamento",
        description: "Por favor, entre em contato com o suporte.",
        variant: "destructive"
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancelPayment = () => {
    setSelectedPlan(null);
  };

  const Footer = () => (
    <footer className="fixed bottom-0 left-0 right-0 p-2 text-center text-xs text-muted-foreground bg-background/80 backdrop-blur-sm z-50 flex flex-wrap justify-center items-center gap-x-4 gap-y-1">
      <span>PriNutriApp © {new Date().getFullYear()}</span>
      <Button variant="link" className="p-1 h-auto text-xs" onClick={() => setShowPrivacyPolicy(true)}>
        Política de Privacidade
      </Button>
      {deferredInstallPrompt && (
        <Button variant="link" className="p-1 h-auto text-xs text-primary flex items-center" onClick={handleInstallClick}>
          <Download className="w-3 h-3 mr-1" /> Instalar App
        </Button>
      )}
    </footer>
  );
  
  const {
    showNewsScreen,
    showAdminNewsScreen,
    showPrivacyPolicy,
    handleCloseNewsScreen,
    handleCloseAdminNewsScreen,
    setShowPrivacyPolicy,
  } = useAppScreenLogic(profile, isAdmin);

  if (showPrivacyPolicy) {
    return <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />;
  }

  const renderLoadingScreen = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-secondary/30 to-primary/30">
      <div className="p-8 bg-card rounded-lg shadow-xl text-center">
        <img alt="PriNutriApp Logo carregando" className="w-32 h-32 mx-auto mb-6" src="https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/ed36e7a1de1c406833a17d7982043f84.png" />
        <h1 className="text-3xl font-bold text-primary mb-2">PriNutriApp</h1>
        <p className="text-muted-foreground">Carregando seu plano personalizado...</p>
        <Loader2 className="mt-6 animate-spin rounded-full h-12 w-12 text-primary mx-auto" />
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) return renderLoadingScreen();
    
    // Se não há sessão ou usuário, mostra o login
    if (!session || !user) return <LoginForm />;
    
    // Se há usuário mas não há perfil, mostra loading (perfil está sendo carregado)
    if (!profile) return renderLoadingScreen();
    
    const updateProfileField = async (field) => {
        try {
            const updatedProfile = await dbUpdateProfile(profile.id, field);
            // Atualizar o perfil localmente usando a função do contexto
            await updateProfile(profile.id);
            console.log("Profile updated successfully:", field, updatedProfile);
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({ title: "Erro ao salvar progresso", description: "Tente novamente.", variant: "destructive" });
        }
    };

    const handleWelcomeComplete = () => updateProfileField({ has_seen_welcome: true });
    const handleSchedulingComplete = () => updateProfileField({ has_scheduled_initial_chat: true });
    const handleAnamnesisComplete = () => updateProfileField({ has_completed_anamnesis: true });

    // Se o usuário está no fluxo de pagamento, mostra a tela de planos
    if (selectedPlan) {
      return (
        <MercadoPagoCheckout
          plan={selectedPlan}
          user={profile}
          onPaymentSuccess={handlePaymentSuccess}
          onCancel={handleCancelPayment}
          loading={processingPayment}
        />
      );
    }

    if (isAdmin) {
      return showAdminNewsScreen ? (
        <AdminNewsScreen user={profile} onClose={handleCloseAdminNewsScreen} />
      ) : (
        <AdminDashboard onLogout={handleLogout} />
      );
    }
    
    // FLUXO DA PACIENTE
    // 0. Escolha de plano (novo fluxo)
    if (!profile.has_paid) {
      return <PlansScreen user={profile} onPlanSelected={handlePlanSelected} loading={processingPayment} />;
    }
    
    // 1. Anamnese (agora vem antes das boas-vindas)
    if (!profile.has_completed_anamnesis) {
      return <AnamnesisForm user={profile} onComplete={handleAnamnesisComplete} />;
    }
    
    // 2. Boas-vindas (apenas para primeiro acesso)
    if (!profile.has_seen_welcome) {
      return <WelcomeScreen user={profile} onContinue={handleWelcomeComplete} />;
    }
    
    // 3. Agendamento inicial (apenas para plano acompanhado)
    if (profile.plan_type === 'acompanhado' && !profile.has_scheduled_initial_chat) {
      return <SchedulingScreen user={profile} onScheduled={handleSchedulingComplete} onCancel={handleLogout} />;
    }
    
    // 4. Aguardando aprovação da nutricionista (apenas para plano acompanhado)
    if (profile.plan_type === 'acompanhado' && !profile.is_approved) {
      return <PostSchedulingWaitScreen user={profile} onLogout={handleLogout} />;
    }
    
    // 5. Após aprovação, mostra novidades (se houver) e depois o dashboard
    if (showNewsScreen) {
      return <NewsScreen user={profile} onClose={handleCloseNewsScreen} />;
    }
    
    // 6. Dashboard principal
    return <Dashboard user={profile} onLogout={handleLogout} />;
  };

  return (
    <ErrorBoundary>
      <div className="font-sans">
        {renderContent()}
        <Toaster />
        {(!loading && session) && <Footer />}
      </div>
    </ErrorBoundary>
  );
}

export default App;


