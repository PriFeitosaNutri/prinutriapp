import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, ShoppingCart, Link as LinkIcon, MessageSquare, ArrowRight, Target, Users, Trophy, X } from 'lucide-react';

const NewsScreen = ({ user, onClose }) => {
  const [updatedSections, setUpdatedSections] = useState([]);
  const [showDCCPopup, setShowDCCPopup] = useState(false);
  const newsScreenImage = "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/9beb35d92e7bc372dfb1263a478bc3c9.png";

  useEffect(() => {
    if (!user || !user.email) return;

    const sections = [
      { key: 'mealPlan', name: 'Plano Alimentar', icon: <BookOpen className="w-6 h-6 text-primary" />, storageKey: `lastUpdate_mealPlan_${user.email}_PriNutriApp`, seenKey: `lastSeen_mealPlan_${user.email}_PriNutriApp` },
      { key: 'shoppingList', name: 'Lista de Compras', icon: <ShoppingCart className="w-6 h-6 text-primary" />, storageKey: `lastUpdate_shoppingList_${user.email}_PriNutriApp`, seenKey: `lastSeen_shoppingList_${user.email}_PriNutriApp` },
      { key: 'materials', name: 'PriNutriFlix', icon: <LinkIcon className="w-6 h-6 text-primary" />, storageKey: `lastUpdate_materials_${user.email}_PriNutriApp`, seenKey: `lastSeen_materials_${user.email}_PriNutriApp` },
      { key: 'messages', name: 'Mensagens da Nutri', icon: <MessageSquare className="w-6 h-6 text-primary" />, storageKey: `lastUpdate_messages_${user.email}_PriNutriApp`, seenKey: `lastSeen_messages_${user.email}_PriNutriApp` },
    ];

    const news = sections.filter(section => {
      const lastUpdate = localStorage.getItem(section.storageKey);
      const lastSeen = localStorage.getItem(section.seenKey);
      return lastUpdate && (!lastSeen || new Date(lastUpdate) > new Date(lastSeen));
    });
    setUpdatedSections(news);

    // Check if user has seen DCC popup
    const hasSeenDCCPopup = localStorage.getItem(`hasSeenDCCPopup_${user.email}_PriNutriApp`);
    if (!hasSeenDCCPopup) {
      setShowDCCPopup(true);
    }
  }, [user]);

  const handleNavigateAndClose = () => {
    if (user && user.email) {
        const sectionsToMark = ['mealPlan', 'shoppingList', 'materials', 'messages'];
        sectionsToMark.forEach(key => {
            localStorage.setItem(`lastSeen_${key}_${user.email}_PriNutriApp`, new Date().toISOString());
        });
    }
    onClose(); 
  };

  const handleCloseDCCPopup = () => {
    localStorage.setItem(`hasSeenDCCPopup_${user.email}_PriNutriApp`, 'true');
    setShowDCCPopup(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/30 to-primary/30 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <motion.div
                animate={{ y: [0, -5, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto mb-4"
            >
                <img src={newsScreenImage} alt="PriNutriApp Mascote Novidades" className="w-28 h-28 object-contain" />
            </motion.div>
            <CardTitle className="text-3xl font-bold text-primary">Novidades no seu App!</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sua nutri preparou coisas novas para você e temos uma novidade especial!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Fixed Meta da Leveza section - always shows */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Button 
                variant="outline" 
                className="w-full justify-start text-left h-auto py-3 border-accent/50 hover:bg-accent/10 bg-gradient-to-r from-accent/5 to-primary/5"
                onClick={handleNavigateAndClose}
              >
                <div className="mr-3 p-2 bg-accent/20 rounded-md">
                  <Target className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-accent">Meta da Leveza: DCC</p>
                  <p className="text-xs text-muted-foreground">Desafio Coletivo do Cuidado - Nova funcionalidade!</p>
                </div>
                <ArrowRight className="ml-auto w-5 h-5 text-accent/70" />
              </Button>
            </motion.div>

            {updatedSections.length > 0 && (
              <ul className="space-y-3">
                {updatedSections.map((section, index) => (
                  <motion.li 
                    key={section.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left h-auto py-3 border-primary/30 hover:bg-primary/10"
                      onClick={handleNavigateAndClose}
                    >
                      <div className="mr-3 p-2 bg-primary/10 rounded-md">{section.icon}</div>
                      <div>
                        <p className="font-semibold text-primary">{section.name}</p>
                        <p className="text-xs text-muted-foreground">Clique para ver as atualizações!</p>
                      </div>
                      <ArrowRight className="ml-auto w-5 h-5 text-primary/70" />
                    </Button>
                  </motion.li>
                ))}
              </ul>
            )}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: updatedSections.length * 0.1 + 0.5 }}>
              <Button onClick={handleNavigateAndClose} className="w-full bg-primary hover:bg-primary/90 text-lg py-3 mt-6">
                Ir para o Dashboard
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* DCC Popup */}
      {showDCCPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-primary">Nova Funcionalidade!</h3>
                  <p className="text-sm text-muted-foreground">Meta da Leveza: DCC</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleCloseDCCPopup}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="text-center mb-6">
              <img 
                src="https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/c5ffe599a2d19a5a5515ecc7db238db2.png" 
                alt="DCC Mascot" 
                className="w-20 h-20 mx-auto mb-3"
              />
              <p className="text-sm text-muted-foreground">
                <strong>Clique na bonequinha com o troféu no topo</strong> pra acessar o Desafio Coletivo do Cuidado e acompanhar a sua Meta da Leveza.
              </p>
              <p className="text-primary font-semibold mt-2">
                Juntas Somos Mais Fortes! 💪✨
              </p>
            </div>

            <Button onClick={handleCloseDCCPopup} className="w-full">
              Entendi! Vamos começar! 🚀
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default NewsScreen;