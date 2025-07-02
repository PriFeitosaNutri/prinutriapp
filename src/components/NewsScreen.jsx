import React, { useEffect, useState } from 'react';
import { updateProfile } from '@/lib/database';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

const NewsScreen = ({ user, onClose }) => {
  const [showDCCPopup, setShowDCCPopup] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.email) {
      const hasSeen = localStorage.getItem(`hasSeenDCCPopup_${user.email}_PriNutriApp`);
      if (!hasSeen) {
        setTimeout(() => {
          setShowDCCPopup(true);
        }, 500); // mostra depois de meio segundo
      }
    }
  }, [user]);

  const handleConfirmAndClose = () => {
    if (user?.id) {
      updateProfile(user.id, { last_news_seen_at: new Date().toISOString() });
    }
    localStorage.setItem(`hasSeenDCCPopup_${user.email}_PriNutriApp`, 'true');
    toast({
      title: 'Tudo certo!',
      description: 'Você já está por dentro das novidades 🥳',
      duration: 3000,
    });
    setShowDCCPopup(false);
    onClose(); // Fecha a NewsScreen pra ir pro app
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Novidades no App! 🗞️
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground text-center">
            <p>🌱 Agora você pode acompanhar seu progresso com figurinhas da hidratação!</p>
            <p>📅 Receba lembretes para os seus agendamentos e mensagens da Nutri!</p>
            <p>🎯 Acesso à Comunidade DCC diretamente do app.</p>
            <p>💬 Mais mensagens motivacionais personalizadas para você!</p>
            <Button
              onClick={handleConfirmAndClose}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base py-2"
            >
              Entendi! Vamos começar 🚀
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* POPUP da Comunidade DCC */}
      {showDCCPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <motion.div
            className="bg-white rounded-xl p-6 shadow-xl max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-bold mb-2">Você já conhece a Comunidade DCC? 💬</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Lá você pode compartilhar conquistas, dúvidas, receitas e ainda receber incentivo das outras mulheres que também estão nessa jornada!
            </p>
            <Button
              onClick={() => setShowDCCPopup(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-base py-2"
            >
              Quero conhecer agora 💚
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default NewsScreen;