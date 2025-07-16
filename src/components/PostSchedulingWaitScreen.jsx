
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { LogOut, CheckCircle, Clock, Heart, ExternalLink } from 'lucide-react';
import { getAppSetting } from '@/lib/database';

const PostSchedulingWaitScreen = ({ user, onLogout }) => {
  const [progress, setProgress] = useState(0);
  const [consultationLink, setConsultationLink] = useState('');

  useEffect(() => {
    const fetchLink = async () => {
      const link = await getAppSetting('consultation_link');
      if (link) {
        setConsultationLink(link);
      }
    };
    fetchLink();

    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 99) {
          // Fica em 99% para mostrar que está quase lá
          return 99;
        }
        const diff = Math.random() * 5;
        return Math.min(oldProgress + diff, 99);
      });
    }, 800);

    return () => clearInterval(timer);
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
                src="/bonequinhanocelular.png" 
                alt="PriNutriApp Mascote Preparando" 
                className="w-32 h-32 object-contain" 
              />
            </motion.div>
            <CardTitle className="text-4xl font-bold text-primary-foreground">Quase lá!</CardTitle>
            <CardDescription className="text-lg text-primary-foreground/90 mt-2">
              Olá, {user.name}! Estamos preparando tudo com muito carinho para você!
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8 space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary text-center mb-6">Seu Status:</h2>
              
              <div className="space-y-4">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200"
                >
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" />
                  <span className="font-medium text-green-800">Anamnese e Agendamento realizados</span>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <Clock className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="font-medium text-blue-800">Aguardando aprovação da Nutri</span>
                    <p className="text-sm text-blue-600 mt-1">
                      Após a consulta, seu acesso será liberado e você receberá uma notificação!
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>

            {consultationLink && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="p-4 bg-accent/10 rounded-lg border border-accent/30"
              >
                <h3 className="font-semibold text-accent mb-2 flex items-center">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Link da Consulta Disponível!
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Sua nutri já disponibilizou o link para a consulta. Acesse no horário agendado:
                </p>
                <Button 
                  asChild 
                  className="w-full bg-accent hover:bg-accent/90"
                >
                  <a href={consultationLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Acessar Consulta
                  </a>
                </Button>
              </motion.div>
            )}

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-3"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Preparando seu ambiente...</span>
                <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="text-center p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg"
            >
              <Heart className="w-8 h-8 text-accent mx-auto mb-3" />
              <p className="text-lg font-medium text-primary mb-2">
                Sua jornada está prestes a começar!
              </p>
              <p className="text-sm text-muted-foreground">
                Enquanto aguarda, que tal já ir se preparando para nosso encontro?
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-center"
            >
              <Button onClick={onLogout} variant="outline" className="border-primary text-primary hover:bg-primary/10">
                <LogOut className="w-4 h-4 mr-2" />
                Sair por enquanto
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PostSchedulingWaitScreen;
