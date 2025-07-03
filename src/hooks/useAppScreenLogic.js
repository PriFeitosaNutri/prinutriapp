import { useState, useEffect } from 'react';
import { updateProfile } from '@/lib/database';

const LATEST_NEWS_DATE = new Date('2025-06-30T00:00:00Z'); // Altere sempre que tiver novidades novas

export const useAppScreenLogic = (user, isAdmin) => {
  const [showNewsScreen, setShowNewsScreen] = useState(false);
  const [showAdminNewsScreen, setShowAdminNewsScreen] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  useEffect(() => {
    if (!user || !user.id || isAdmin) return;

    if (user.is_approved) {
      const lastSeen = user.last_news_seen_at ? new Date(user.last_news_seen_at) : null;
      if (!lastSeen || lastSeen < LATEST_NEWS_DATE) {
        setShowNewsScreen(true);
      }
    }
  }, [user, isAdmin]);

  const handleCloseNewsScreen = () => {
  if (user && user.id) {
    updateProfile(user.id, { last_news_seen_at: new Date().toISOString() })
      .then(() => {
        // Recarrega a página para garantir que o estado seja atualizado
        window.location.reload();
      })
      .catch((error) => {
        console.error("Erro ao atualizar perfil:", error);
        setShowNewsScreen(false); // fallback caso falhe
      });
  } else {
    setShowNewsScreen(false);
  }
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
