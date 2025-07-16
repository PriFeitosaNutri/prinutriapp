import { supabase } from "../lib/supabaseClient";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { PlayCircle, FileText } from 'lucide-react';

const WelcomeScreen = ({ user, onContinue }) => {
  const videoUrl = "https://www.youtube.com/embed/I3ejjYmKv1Y?si=0ibGUoKg85mu2ZV_&autoplay=1";

  const handleContinue = async () => {
    await supabase
      .from("profiles")
      .update({ has_seen_welcome: true })
      .eq("id", user.id);

    onContinue(); // continuar fluxo
  };

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
              <div className="aspect-video rounded-lg overflow-hidden shadow-lg border-2 border-primary/30">
                <iframe width="100%" height="100%" src={videoUrl} title="Vídeo de Boas Vindas" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
              </div>
              <p className="text-sm text-muted-foreground mt-3">Assista ao vídeo para dicas iniciais e para conhecer melhor como o app te ajudará.</p>
            </div>
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold text-primary">Próximo Passo: Nosso Bate-Papo!</h3>
              <p className="text-muted-foreground">Vamos conversar para alinhar suas expectativas e tirar todas as suas dúvidas. Clique abaixo para agendar.</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={handleContinue} size="lg" className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3 px-8 shadow-lg">
                  <FileText className="w-6 h-6 mr-3" />Agendar Bate-Papo com a Nutri
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