import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Trophy } from 'lucide-react';

const NewsScreen = ({ onContinue, showPopupDCC, handleClosePopupDCC }) => {
  const { toast } = useToast();

  const handleClickPopup = () => {
    handleClosePopupDCC();
    toast({
      title: 'Tudo certo!',
      description: 'Você já está por dentro das novidades 🥳',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {showPopupDCC && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center border-2 border-accent space-y-4 relative">
            <button
              onClick={handleClosePopupDCC}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <div className="flex items-center justify-center text-green-600 text-2xl font-bold">
              <Trophy className="mr-2" /> Nova Funcionalidade!
            </div>
            <div className="text-muted-foreground text-sm">Meta da Leveza: DCC</div>
            <img
              src="https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/199ce3d3822c89edc91c7aafa3cfdbd7.png"
              alt="Mascote"
              className="w-24 h-24 mx-auto"
            />
            <p className="text-sm font-semibold">
              <strong>Clique na bonequinha com o troféu no topo</strong> para acessar o Desafio Coletivo do Cuidado e acompanhar a sua Meta da Leveza.
            </p>
            <p className="text-green-700 text-sm font-bold">Juntas Somos Mais Fortes! 💪✨</p>
            <Button onClick={handleClickPopup} className="bg-green-600 hover:bg-green-700 w-full">
              Entendi! Vamos começar! 🚀
            </Button>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8"
      >
        <Card>
          <CardHeader className="text-center">
            <img
              src="/bonequinha-verde.png"
              alt="Nutri"
              className="w-24 h-24 mx-auto"
            />
            <CardTitle className="text-3xl font-bold text-green-700">Novidades no seu App! 🗞️</CardTitle>
            <p className="text-muted-foreground mt-2">Sua nutri preparou coisas novas para você e temos uma novidade especial!</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 text-left text-muted-foreground text-sm">
              <li>🌱 Agora você pode acompanhar seu progresso com figurinhas da hidratação!</li>
              <li>📅 Receba lembretes para os seus agendamentos e mensagens da Nutri!</li>
              <li>🎯 Acesso à Comunidade DCC diretamente do app.</li>
              <li>💬 Mais mensagens motivacionais personalizadas para você!</li>
            </ul>
            <div className="text-center pt-4">
              <Button onClick={onContinue} className="bg-green-600 hover:bg-green-700 text-white w-full">
                Entendi! Vamos começar 🚀
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default NewsScreen;
