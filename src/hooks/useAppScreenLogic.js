import { useState, useEffect } from 'react';
import { updateProfile } from '@/lib/database';

export const useAppScreenLogic = (user, isAdmin) => {
  const [showNewsScreen, setShowNewsScreen] = useState(false);
  const [showAdminNewsScreen, setShowAdminNewsScreen] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  useEffect(() => {
    if (!user || !user.id || isAdmin) return;

    if (user.is_approved) {
        const lastSeen = user.last_news_seen_at;
        const twentyFourHours = 24 * 60 * 60 * 1000;

        if (!lastSeen || Date.now() - new Date(lastSeen).getTime() > twentyFourHours) {
            setShowNewsScreen(true);
        }
    }
    
  }, [user, isAdmin]);

  const handleCloseNewsScreen = () => {
    if (user && user.id) {
        updateProfile(user.id, { 'last_news_seen_at': new Date().toISOString() });
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