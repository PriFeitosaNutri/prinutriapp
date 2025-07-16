import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { getProfile } from '@/lib/database';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();

  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true); // Único estado de loading

  const handleAuthChange = useCallback(async (currentSession) => {
    setLoading(true);
    setSession(currentSession);
    const currentUser = currentSession?.user;

    if (currentUser) {
      try {
        const userProfile = await getProfile(currentUser.id);
        setProfile(userProfile);
      } catch (error) {
        console.error('Error fetching profile on auth state change:', error);
        setProfile(null);
        if (error.message.includes('Invalid Refresh Token') || error.message.includes('JWT expired')) {
            toast({ title: "Sessão expirada", description: "Por favor, faça login novamente.", variant: "destructive" });
            await supabase.auth.signOut();
        }
      }
    } else {
      setProfile(null);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    const fetchInitialSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      await handleAuthChange(currentSession);
    };

    fetchInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        // Tratamento especial para confirmação de e-mail
        if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
          console.log('User email confirmed, proceeding with auth flow');
        }
        
        await handleAuthChange(session);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [handleAuthChange]);

  const updateProfile = useCallback(async (userId) => {
    try {
      const userProfile = await getProfile(userId);
      setProfile(userProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }, []);

  const signIn = useCallback(async (email, password) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      let errorMessage = "E-mail ou senha inválidos.";
      
      // Mensagens de erro mais específicas
      if (error.message.includes('Email not confirmed')) {
        errorMessage = "Por favor, confirme seu e-mail antes de fazer login. Verifique sua caixa de entrada.";
      } else if (error.message.includes('Invalid login credentials')) {
        errorMessage = "E-mail ou senha incorretos. Verifique suas credenciais.";
      } else if (error.message.includes('Too many requests')) {
        errorMessage = "Muitas tentativas de login. Tente novamente em alguns minutos.";
      }
      
      toast({
        variant: "destructive",
        title: "Falha no Login",
        description: errorMessage,
      });
      setLoading(false);
      return { error };
    }

    // Login bem-sucedido - o onAuthStateChange cuidará do resto
    console.log('Login successful for:', email);
    return { error: null, data };
  }, [toast]);

  const signOut = useCallback(async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Falha ao Sair",
        description: error.message,
      });
    }
    setProfile(null);
    setSession(null);
    setLoading(false);
    return { error };
  }, [toast]);
  
  const value = useMemo(() => ({
    user: session?.user ?? null,
    session,
    profile,
    loading,
    signIn,
    signOut,
    updateProfile,
  }), [session, profile, loading, signIn, signOut, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};