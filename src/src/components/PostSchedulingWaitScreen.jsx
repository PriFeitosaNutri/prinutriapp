import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { LogOut, CheckCircle, Clock, Heart, ExternalLink } from 'lucide-react';

const PostSchedulingWaitScreen = ({ onLogout }) => {
  const [progress, setProgress] = useState(0);
  const [consultationLink, setConsultationLink] = useState('');

  useEffect(() => {
    // Load consultation link if available
    const savedLink = localStorage.getItem('globalConsultationLink_PriNutriApp');
    if (savedLink) {
      setConsultationLink(savedLink);
    }

    // Animate progress bar
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(timer);
          return 100;
        }
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 100);
      });
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary to-accent p-8 text-center">
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto mb-4"
            >
              <img 
                src="https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/60bcbd3eeb5dd417461a84863c1313b6.png" 
                alt="PriNutriApp Mascote Preparando" 
                className="w-32 h-32 object-contain" 
              />
            </motion.div>
            <CardTitle className="text-4xl font-bold text-primary-foreground">Quase lá!</CardTitle>
            <CardDescription className="text-lg text-primary-foreground/90 mt-2">
              Estamos preparando tudo com muito carinho para você!
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8 space-y-8">
            {/* Status Checklist */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary text-center mb-6">Seu Status:</h2>
              
              <div className="space-y-4">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200"
                >
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                  <span className="font-medium text-green-800">Anamnese realizada</span>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200"
                >
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                  <span className="font-medium text-green-800">Agendamento realizado</span>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <Clock className="w-6 h-6 text-blue-600 mr-3" />
                  <div className="flex-1">
                    <span className="font-medium text-blue-800">Em breve você receberá uma mensagem no WhatsApp</span>
                    <p className="text-sm text-blue-600 mt-1">
                      Com o link da sua consulta no Zoom e seu acesso será liberado!
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Consultation Link (if available) */}
            {consultationLink && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="p-4 bg-accent/10 rounded-lg border border-accent/30"
              >
                <h3 className="font-semibold text-accent mb-2 flex items-center">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Link da Consulta Disponível!
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Sua nutri disponibilizou o link para a consulta:
                </p>
                <Button 
                  asChild 
                  className="w-full bg-accent hover:bg-accent/90"
                >
                  <a href={consultationLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Acessar Consulta no Zoom
                  </a>
                </Button>
              </motion.div>
            )}

            {/* Progress Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="space-y-3"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Preparando seu ambiente...</span>
                <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </motion.div>

            {/* Motivational Message */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="text-center p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg"
            >
              <Heart className="w-8 h-8 text-accent mx-auto mb-3" />
              <p className="text-lg font-medium text-primary mb-2">
                Sua Nutri está preparando tudo com muito carinho para você!
              </p>
              <p className="text-sm text-muted-foreground">
                Aguarde a liberação do seu acesso após a consulta inicial. 
                Em breve você terá acesso completo ao PriNutriApp!
              </p>
            </motion.div>

            {/* Logout Button */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="text-center"
            >
              <Button onClick={onLogout} variant="outline" className="border-primary text-primary hover:bg-primary/10">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PostSchedulingWaitScreen;