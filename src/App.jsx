import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppScreenLogic } from '@/hooks/useAppScreenLogic';
import WelcomeScreen from '@/components/WelcomeScreen';
import AnamnesisForm from '@/components/AnamnesisForm';
import SchedulingScreen from '@/components/SchedulingScreen.jsx';
import NewsScreen from '@/components/NewsScreen';
import Dashboard from '@/components/Dashboard';
import LoadingScreen from '@/components/LoadingScreen';
import AdminDashboard from '@/components/AdminDashboard';

const App = () => {
  const { user, isLoading, logout, isAdmin } = useUser();
  const {
    showNewsScreen,
    handleCloseNewsScreen,
    showPrivacyPolicy,
    setShowPrivacyPolicy,
  } = useAppScreenLogic(user, isAdmin);

  const handleLogout = () => {
    logout();
  };

  if (isLoading) return <LoadingScreen />;

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Você precisa estar logada para acessar o app.</p>
      </div>
    );
  }

  if (isAdmin) {
    return <AdminDashboard />;
  }

  if (!user.has_seen_welcome) {
    return (
      <WelcomeScreen
        user={user}
        onContinue={() => window.location.reload()}
      />
    );
  }

  if (!user.has_scheduled_initial_chat) {
    return <SchedulingScreen user={user} />;
  }

  if (!user.has_completed_anamnesis) {
    return <AnamnesisScreen user={user} />;
  }

  // ✅ Tela de novidades + popup
  if (
    user.has_seen_welcome &&
    user.has_scheduled_initial_chat &&
    user.has_completed_anamnesis &&
    user.is_approved
  ) {
    if (showNewsScreen) {
      return (
        <NewsScreen
          user={user}
          onContinue={handleCloseNewsScreen}
          showPopupDCC={true}
          handleClosePopupDCC={handleCloseNewsScreen}
        />
      );
    }

    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <p>
        Aguardando aprovação da Nutri. Assim que for liberada, seu app estará prontinho pra você! 💚
      </p>
    </div>
  );
};

export default App;

