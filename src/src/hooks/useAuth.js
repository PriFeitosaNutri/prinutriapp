import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getProfile, updateProfile as updateProfileInDb } from '@/lib/database';

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || 'admin@prinutriapp.com,projetolevezadeverdade@gmail.com').split(',');

const normalizeEmailForAuth = (emailStr) => (emailStr ? emailStr.toLowerCase().trim() : '');

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(null);

  const fetchUserProfile = useCallback(async (supabaseUser) => {
    if (!supabaseUser) return null;
    
    try {
      const profile = await getProfile(supabaseUser.id);
      return profile || { 
        id: supabaseUser.id, 
        email: normalizeEmailForAuth(supabaseUser.email),
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Usuário',
        has_seen_welcome: false,
        has_scheduled_initial_chat: false,
        has_completed_anamnesis: false,
        is_approved: false
      };
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return { 
        id: supabaseUser.id, 
        email: normalizeEmailForAuth(supabaseUser.email),
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Usuário',
        has_seen_welcome: false,
        has_scheduled_initial_chat: false,
        has_completed_anamnesis: false,
        is_approved: false
      };
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    
    const handleStateChange = async (newSession) => {
      if (!mounted) return;
      
      setIsLoading(true);
      setSession(newSession);
      
      if (newSession?.user) {
        try {
          const profile = await fetchUserProfile(newSession.user);
          if (mounted) {
            setUser(profile);
            setIsAdmin(ADMIN_EMAILS.includes(normalizeEmailForAuth(profile?.email)));
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
          if (mounted) {
            setUser(null);
            setIsAdmin(false);
          }
        }
      } else {
        if (mounted) {
          setUser(null);
          setIsAdmin(false);
        }
      }
      
      if (mounted) {
        setIsLoading(false);
      }
    };

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Error on initial session load:', error.message);
          handleStateChange(null);
        } else {
          handleStateChange(session);
        }
      } catch (err) {
        console.error('Critical error on getSession:', err.message);
        handleStateChange(null);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        handleStateChange(session);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchUserProfile]);

  const handleLogin = async (email, password) => {
    const normalizedEmail = normalizeEmailForAuth(email);
    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    if (error) throw error;
  };

  const handleRegister = async (fullName, email, password, whatsapp) => {
    const normalizedEmail = normalizeEmailForAuth(email);
    const { error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          name: fullName,
          whatsapp: whatsapp || null,
        },
      },
    });
    if (error) throw error;
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error && !error.message.includes('session does not exist')) {
        console.error('Logout error:', error.message);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfileField = async (field, value) => {
    if (!user || !user.id) return;
    
    setIsLoading(true);
    try {
      const updatedProfile = await updateProfileInDb(user.id, { [field]: value });
      setUser(updatedProfile);
    } catch (error) {
      console.error(`Error updating profile with ${field}:`, error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnamnesisComplete = () => updateProfileField('has_completed_anamnesis', true);
  const handleWelcomeComplete = () => updateProfileField('has_seen_welcome', true);
  const handleSchedulingComplete = () => updateProfileField('has_scheduled_initial_chat', true);

  return {
    user,
    isAdmin,
    isLoading,
    session,
    handleLogin,
    handleRegister,
    handleLogout,
    updateProfileField,
    handleAnamnesisComplete,
    handleWelcomeComplete,
    handleSchedulingComplete,
  };
};