import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const NewsScreen = ({ user, onContinue, showPopupDCC, handleClosePopupDCC }) => {
  const [showPopup, setShowPopup] = useState(showPopupDCC);

  useEffect(() => {
    if (showPopup) {
      toast("🎉 Você está dentro da Comunidade DCC!");
    }
  }, [showPopup]);

  const handleContinueClick = () => {
    setShowPopup(false);
    handleClosePopupDCC?.();
    onContinue?.(); // fecha a tela e atualiza last_news_seen_at
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-xl text-center space-y-6"
      >
        <motion.img
          src="https://cdn-icons-png.flaticon.com/512/3870/3870822.png"
          alt="Bonequinha feliz"
          className="w-28 h-28 mx-auto"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
        />
        <h1 className="text-3xl font-bold text-primary">Novidades fresquinhas!</h1>
        <p className="text-muted-foreground">A nutri preparou conteúdos novos e exclusivos para você na Comunidade DCC. Bora conferir?</p>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-accent text-accent-foreground p-4 rounded-md shadow-lg"
          >
            🎉 Você está dentro da Comunidade DCC!
          </motion.div>
        )}
        <Button onClick={handleContinueClick} className="mt-4 text-lg py-2 px-6 shadow-md">
          Acessar o app
        </Button>
      </motion.div>
    </div>
  );
};

export default NewsScreen;
