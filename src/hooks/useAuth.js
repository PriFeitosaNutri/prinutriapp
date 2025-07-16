import { useCallback } from 'react';
import { useAuthContext } from '@/contexts/AppAuthProvider';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

// O hook useAuth agora é um consumidor direto do AppAuthProvider.
// Ele não gerencia mais o estado, apenas expõe os valores e funções do contexto.
export const useAuth = () => {
  const context = useAuthContext();
  const { toast } = useToast();

  // A verificação de contexto já é feita dentro do useAuthContext.
  const { 
    user, 
    session, 
    profile,
    loading,
    signIn: contextSignIn,
    signOut: contextSignOut,
    updateProfile,
  } = context;

  const handleLogin = useCallback(async (email, password) => {
    // Chama a função signIn diretamente do contexto.
    // O tratamento de erro e toast já está lá.
    await contextSignIn(email, password);
  }, [contextSignIn]);

  const handleRegister = useCallback(async (fullName, email, password, whatsapp) => {
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: fullName,
            whatsapp: whatsapp || '',
          },
          emailRedirectTo: `${window.location.origin}/#/confirm`,
        },
      });

      if (signUpError) {
        toast({
          title: "Falha no Registro",
          description: signUpError.message,
          variant: "destructive",
        });
        return { error: signUpError };
      }

      if (!authData.user) {
        const errorMessage = "O registro não retornou um usuário. Tente novamente.";
        toast({
          title: "Falha no Registro",
          description: errorMessage,
          variant: "destructive",
        });
        return { error: new Error(errorMessage) };
      }

      // Se o usuário foi criado mas precisa confirmar o e-mail
      if (authData.user && !authData.session) {
        toast({
          title: "Conta criada com sucesso! 🎉",
          description: "Verifique seu e-mail e clique no link de confirmação. Após confirmar, volte aqui e faça login.",
          className: "bg-green-600 text-white",
          duration: 10000,
        });
        return { user: authData.user, error: null, needsEmailConfirmation: true };
      }

      // Se o usuário foi criado e já tem sessão (confirmação automática)
      if (authData.user && authData.session) {
        toast({
          title: "Conta criada e confirmada! 🎉",
          description: "Bem-vindo ao PriNutriApp!",
          className: "bg-green-600 text-white",
          duration: 5000,
        });
        return { user: authData.user, error: null, needsEmailConfirmation: false };
      }

      return { user: authData.user, error: null };
    } catch (error) {
      console.error('Erro no registro:', error);
      toast({
        title: "Erro no Registro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return { error };
    }
  }, [toast]);

  const signOut = async () => {
    await contextSignOut();
  };

  return {
    user,
    session,
    loading,
    profile,
    isAdmin: profile?.is_admin ?? false,
    handleLogin,
    handleRegister,
    signOut,
    updateProfile,
  };
};