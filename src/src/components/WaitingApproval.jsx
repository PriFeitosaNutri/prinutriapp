import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Clock, LogOut, ExternalLink } from 'lucide-react';

const WaitingApproval = ({ onLogout }) => {
  // Get consultation link if available
  const consultationLink = localStorage.getItem('globalConsultationLink_PriNutriApp') || '';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl text-center border-2 border-primary/10">
          <CardHeader>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto mb-4 w-24 h-24"
            >
              <img 
                alt="Bonequinha dando joinha" 
                className="w-full h-full object-contain" 
                src="https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/5bdb4d77dbf16491b7fcb5a85f7f877c.png" 
              />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-primary">
              Quase lá!
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sua anamnese foi enviada com sucesso para a Nutri!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-foreground/90 space-y-3 bg-primary/5 p-4 rounded-lg">
                <p className="font-semibold text-primary">Seu Status:</p>
                <p>✅ Anamnese recebida</p>
                <p>⏳ Análise em andamento</p>
                <p>🎉 Em breve seu acesso será liberado!</p>
            </div>
            
            {/* Show consultation link if available */}
            {consultationLink && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 rounded-lg p-4"
              >
                <p className="text-green-700 font-semibold mb-2">🎉 Sua consulta está disponível!</p>
                <Button 
                  onClick={() => window.open(consultationLink, '_blank')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Acessar Consulta
                </Button>
              </motion.div>
            )}
            
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="bg-primary/10 rounded-lg p-4 mt-6"
            >
              <p className="text-primary text-sm font-semibold">
                Sua nutri está preparando tudo com muito carinho para você!
              </p>
            </motion.div>

            <Button 
              onClick={onLogout}
              variant="outline" 
              className="w-full mt-6 text-primary border-primary hover:bg-primary/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default WaitingApproval;