import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import LoginForm from '@/components/LoginForm';
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
import { Download } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAppScreenLogic } from '@/hooks/useAppScreenLogic';

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
    isLoading: authIsLoading,
    handleLogout,
    handleAnamnesisComplete,
    handleWelcomeComplete,
    handleSchedulingComplete,
    session,
  } = useAuth();

  const {
    showNewsScreen,
    showAdminNewsScreen,
    showPrivacyPolicy,
    handleCloseNewsScreen,
    handleCloseAdminNewsScreen,
    setShowPrivacyPolicy,
  } = useAppScreenLogic(user, isAdmin);

  const { toast } = useToast();
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);

  useEffect(() => {
    document.title = "PriNutriApp";
    const beforeInstallPromptHandler = (e) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);
    return () => window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      toast({ title: outcome === 'accepted' ? "Instalado! 🎉" : "Instalação cancelada" });
      setDeferredInstallPrompt(null);
    }
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
  
  if (showPrivacyPolicy) {
    return <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />;
  }

  const renderLoadingScreen = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-secondary/30 to-primary/30">
      <div className="p-8 bg-card rounded-lg shadow-xl text-center">
        <img alt="PriNutriApp Logo carregando" className="w-32 h-32 mx-auto mb-6" src="https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/199ce3d3822c89edc91c7aafa3cfdbd7.png" />
        <h1 className="text-3xl font-bold text-primary mb-2">PriNutriApp</h1>
        <p className="text-muted-foreground">Carregando seu plano personalizado...</p>
        <div className="mt-6 animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (authIsLoading) return renderLoadingScreen();
    if (!session || !user) return <LoginForm />;
    if (isAdmin) {
      return showAdminNewsScreen ? (
        <AdminNewsScreen user={user} onClose={handleCloseAdminNewsScreen} />
      ) : (
        <AdminDashboard user={user} onLogout={handleLogout} />
      );
    }
    
    if (!user.has_seen_welcome) return <WelcomeScreen user={user} onContinue={handleWelcomeComplete} />;
    if (!user.has_scheduled_initial_chat) return <SchedulingScreen user={user} onScheduled={handleSchedulingComplete} onCancel={() => {}} />;
    if (!user.has_completed_anamnesis) return <AnamnesisForm user={user} onComplete={handleAnamnesisComplete} />;
    if (!user.is_approved) return <PostSchedulingWaitScreen user={user} onLogout={handleLogout} />;
    if (
  user.has_seen_welcome &&
  user.has_scheduled_initial_chat &&
  user.has_completed_anamnesis &&
  user.is_approved
) {
  return <NewsScreen user={user} onClose={handleCloseNewsScreen} />;
}
    
    return <Dashboard user={user} onLogout={handleLogout} />;
  };

  return (
    <ErrorBoundary>
      <div className="font-sans">
        {renderContent()}
        <Toaster />
        {!authIsLoading && <Footer />}
      </div>
    </ErrorBoundary>
  );
}

export default App;