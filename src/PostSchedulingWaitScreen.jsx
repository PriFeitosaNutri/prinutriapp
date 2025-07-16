import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { LogOut, CheckCircle, Clock, Heart } from 'lucide-react';

const PostSchedulingWaitScreen = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl">
        <Card className="shadow-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary to-accent p-8 text-center">
            <motion.div animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="mx-auto mb-4">
              <img src="/bonequinhanocelular.png" alt="PriNutriApp Mascote Preparando" className="w-32 h-32 object-contain" />
            </motion.div>
            <CardTitle className="text-4xl font-bold text-primary-foreground">Tudo Certo, {user.name}!</CardTitle>
            <CardDescription className="text-lg text-primary-foreground/90 mt-2">
              Suas informações foram recebidas e seu bate-papo está agendado!
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary text-center mb-6">Seu Status:</h2>
              <div className="space-y-4">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                  <span className="font-medium text-green-800">Anamnese realizada</span>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                  <span className="font-medium text-green-800">Agendamento realizado</span>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Clock className="w-6 h-6 text-blue-600 mr-3" />
                  <div className="flex-1">
                    <span className="font-medium text-blue-800">Aguardando liberação do acesso</span>
                    <p className="text-sm text-blue-600 mt-1">
                      Após o bate-papo inicial, sua nutri liberará seu acesso completo!
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="text-center p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
              <Heart className="w-8 h-8 text-accent mx-auto mb-3" />
              <p className="text-lg font-medium text-primary mb-2">
                Sua Nutri está ansiosa para começar essa jornada com você!
              </p>
              <p className="text-sm text-muted-foreground">
                Qualquer dúvida, entre em contato pelo WhatsApp.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="text-center">
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