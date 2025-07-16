
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export const useAppScreenLogic = (profile, isAdmin) => {
  const [showNewsScreen, setShowNewsScreen] = useState(false);
  const [showAdminNewsScreen, setShowAdminNewsScreen] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const checkNews = useCallback(async () => {
    if (!profile || !profile.id || isAdmin) return;

    const { data: newsItems, error } = await supabase
      .from('news')
      .select('id', { count: 'exact' })
      .or(`target_user_id.is.null,target_user_id.eq.${profile.id}`)
      .gt('created_at', profile.last_news_seen_at || new Date(0).toISOString());

    if (error) {
      console.error("Error checking for news:", error);
      return;
    }

    if (newsItems.length > 0) {
      setShowNewsScreen(true);
    }
  }, [profile, isAdmin]);

  useEffect(() => {
    if (profile && profile.is_approved && !isAdmin) {
      // Sempre mostra a tela de novidades para pacientes aprovados
      setShowNewsScreen(true);
    }
    
    if (isAdmin) {
      // Para admins, sempre mostra a tela de novidades do admin
      setShowAdminNewsScreen(true);
    }
  }, [profile, isAdmin]);

  const handleCloseNewsScreen = async () => {
    if (profile && profile.id) {
      try {
        await supabase
          .from('profiles')
          .update({ last_news_seen_at: new Date().toISOString() })
          .eq('id', profile.id);
      } catch (error) {
        console.error("Failed to update last_news_seen_at:", error);
      }
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
