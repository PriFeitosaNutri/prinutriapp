
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { PlayCircle, CalendarPlus, Loader2 } from 'lucide-react';
import { getAppSetting } from '@/lib/database';
import { useToast } from '@/components/ui/use-toast';

const WelcomeScreen = ({ user, onContinue }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchVideoUrl = useCallback(async () => {
    try {
      const settingValue = await getAppSetting('welcome_video_url');
      if (settingValue) {
        // Ensure it's a valid embed URL
        const videoId = settingValue.split('v=')[1]?.split('&')[0] || settingValue.split('/').pop();
        setVideoUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1`);
      } else {
        setVideoUrl("https://www.youtube.com/embed/I3ejjYmKv1Y?autoplay=1"); // Fallback
      }
    } catch (error) {
      toast({
        title: "Não foi possível carregar o vídeo",
        description: "Usando vídeo padrão. A funcionalidade principal não foi afetada.",
        variant: "destructive"
      });
      setVideoUrl("https://www.youtube.com/embed/I3ejjYmKv1Y?autoplay=1"); // Fallback
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchVideoUrl();
  }, [fetchVideoUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, type: 'spring', stiffness: 120 }} className="w-full max-w-2xl">
        <Card className="shadow-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary to-accent p-8 text-center">
            <motion.div initial={{ rotateY: -180, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} transition={{ duration: 0.7, delay: 0.2 }}>
              <img src="https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/199ce3d3822c89edc91c7aafa3cfdbd7.png" alt="PriNutriApp Logo" className="w-24 h-24 mx-auto mb-4 rounded-full shadow-lg border-4 border-white" />
            </motion.div>
            <CardTitle className="text-4xl font-bold text-primary-foreground">Bem-vinda ao PriNutriApp, {user.name}!</CardTitle>
            <CardDescription className="text-lg text-primary-foreground/90 mt-2">Sua jornada para uma vida mais saudável começa AGORA!</CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-primary mb-3 flex items-center justify-center"><PlayCircle className="w-8 h-8 mr-3 text-accent" />Uma Mensagem Especial para Você!</h2>
              {isLoading ? (
                <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </div>
              ) : (
                <div className="aspect-video rounded-lg overflow-hidden shadow-lg border-2 border-primary/30">
                  <iframe width="100%" height="100%" src={videoUrl} title="Vídeo de Boas Vindas" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-3">Assista ao vídeo para dicas iniciais e para conhecer melhor como o app te ajudará.</p>
            </div>
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold text-primary">Próximo Passo: Nosso Bate-Papo!</h3>
              <p className="text-muted-foreground">Vamos conversar para alinhar suas expectativas e tirar todas as suas dúvidas. Clique abaixo para agendar.</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={onContinue} size="lg" className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3 px-8 shadow-lg">
                  <CalendarPlus className="w-6 h-6 mr-3" />Agendar Bate-Papo com a Nutri
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
