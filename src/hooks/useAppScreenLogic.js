import { useState, useEffect } from 'react';
import { updateProfile } from '@/lib/database';

export const useAppScreenLogic = (user, isAdmin) => {
  const [showNewsScreen, setShowNewsScreen] = useState(false);
  const [showAdminNewsScreen, setShowAdminNewsScreen] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  useEffect(() => {
    if (!user || !user.id || isAdmin) return;

    // Só mostra a tela de novidades se o vídeo de boas-vindas já foi visto
    if (user.is_approved && user.has_seen_welcome) {
      const lastSeen = user.last_news_seen_at;
      const twentyFourHours = 24 * 60 * 60 * 1000;

      // Se nunca viu ou já passou 24h desde a última vez
      if (!lastSeen || Date.now() - new Date(lastSeen).getTime() > twentyFourHours) {
        // Delayzinho pra evitar sobrepor com a animação do login
        setTimeout(() => {
          setShowNewsScreen(true);
        }, 300);
      }
    }
  }, [user, isAdmin]);

  const handleCloseNewsScreen = () => {
    if (user && user.id) {
      updateProfile(user.id, { last_news_seen_at: new Date().toISOString() });
    }
    setShowNewsScreen(false);
  };

  const handleCloseAdminNewsScreen = () => {
    setShowAdminNewsScreen(false);
  };

  return {
    showNewsScreen,
    showAdminNewsScreen,
    showPrivacyPolicy,
    handleCloseNewsScreen,
    handleCloseAdminNewsScreen,
    setShowPrivacyPolicy,
  };
};
