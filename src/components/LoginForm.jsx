import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { handleLogin, handleRegister, loading: authLoading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!email || !password || (isRegistering && !fullName)) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha nome completo (se registrando), email e senha.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    if (isRegistering) {
      const { error, needsEmailConfirmation } = await handleRegister(fullName, email, password, whatsapp);
      if (!error) {
        if (needsEmailConfirmation) {
          // Limpa os campos mas mantém o email para facilitar o login posterior
          setFullName('');
          setWhatsapp('');
          setPassword('');
          setIsRegistering(false);
        } else {
          // Se não precisa de confirmação, limpa tudo
          setIsRegistering(false);
          setFullName('');
          setWhatsapp('');
          setEmail('');
          setPassword('');
        }
      }
    } else {
      const { error } = await handleLogin(email, password);
      if (!error) {
        // Login bem-sucedido, os campos serão limpos automaticamente
        // quando o componente for desmontado
      }
    }
    setIsSubmitting(false);
  };

  const isLoading = authLoading || isSubmitting;

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <motion.div
              animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="mx-auto mb-4"
            >
              <img src="https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/ed36e7a1de1c406833a17d7982043f84.png" alt="PriNutriApp Logo" className="w-28 h-28" />
            </motion.div>
            <CardTitle className="text-3xl font-bold text-primary">
              PriNutriApp
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isRegistering ? "Crie sua conta para começar" : "Acesse seu plano nutricional"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegistering && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome Completo</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Seu nome completo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp (Opcional)</Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      placeholder="(XX) XXXXX-XXXX"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="•••••••• (mínimo 6 caracteres)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  isRegistering ? 'Criar Conta' : 'Entrar'
                )}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-muted-foreground hover:text-primary"
                disabled={isLoading}
              >
                {isRegistering ? 'Já tem uma conta? Faça login' : 'Não tem conta? Registre-se aqui'}
              </Button>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700 text-center">
                💡 <strong>Sua conta funciona em qualquer dispositivo!</strong> Use o mesmo email e senha no celular ou computador.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginForm;