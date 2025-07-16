import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Target, Trophy, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const NewsScreen = ({ user, onClose }) => {
  const [updatedSections, setUpdatedSections] = useState([]);
  const [showDCCPopup, setShowDCCPopup] = useState(false);
  const newsScreenImage = "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/9beb35d92e7bc372dfb1263a478bc3c9.png";

  useEffect(() => {
    if (!user || !user.id) return;

    const fetchNews = async () => {
        const { data: newsItems, error } = await supabase
            .from('news')
            .select('*')
            .or(`target_user_id.is.null,target_user_id.eq.${user.id}`)
            .gt('created_at', user.last_news_seen_at || new Date(0).toISOString())
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching news:", error);
            return;
        }

        const news = newsItems.map(item => ({
            key: item.id,
            name: item.title,
            description: item.content,
            icon: <Target className="w-6 h-6 text-primary" />,
        }));
        setUpdatedSections(news);
    };

    fetchNews();

    const hasSeenDCCPopup = false; // Sempre mostra a pop-up da DCC
    if (user.is_approved) {
      setShowDCCPopup(true);
    }
  }, [user]);

  const handleNavigateAndClose = async () => {
    if (user && user.id) {
        await supabase
            .from('profiles')
            .update({ last_news_seen_at: new Date().toISOString() })
            .eq('id', user.id);
    }
    onClose(); 
  };

  const handleCloseDCCPopup = () => {
    // Não salva mais no localStorage para que apareça sempre
    setShowDCCPopup(false);
  };
  
    // Sempre mostra a tela, mesmo sem novidades, para garantir que a pop-up da DCC apareça
    // if (updatedSections.length === 0 && !showDCCPopup) {
    //     onClose();
    //     return null;
    // }

  return (
    <AnimatePresence>
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
                Sua nutri preparou coisas novas para você. Confira!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {updatedSections.length > 0 ? (
                <ul className="space-y-3">
                  {updatedSections.map((section, index) => (
                    <motion.li 
                      key={section.key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="w-full justify-start text-left h-auto py-3 px-4 border-primary/30 hover:bg-primary/10 rounded-lg flex items-center">
                        <div className="mr-3 p-2 bg-primary/10 rounded-md">{section.icon}</div>
                        <div>
                          <p className="font-semibold text-primary">{section.name}</p>
                          <p className="text-xs text-muted-foreground">{section.description}</p>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-muted-foreground">Nenhuma novidade por enquanto, mas fique de olho!</p>
              )}

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: updatedSections.length * 0.1 + 0.2 }}>
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
            onClick={handleCloseDCCPopup}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl relative"
            >
              <img src="https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/b545f5a896d8e87491753c1539268612.gif" alt="DCC Animation" className="absolute -top-12 right-0 w-24 h-24 sm:-right-16 sm:-top-16 sm:w-32 sm:h-32 transform -scale-x-100" />

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
    </AnimatePresence>
  );
};

export default NewsScreen;