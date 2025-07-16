import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { AlertTriangle, MessageSquare, RefreshCw } from 'lucide-react';

const ErrorScreen = ({ error, errorInfo, onContact }) => {
  const errorImageUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/29dc568fec29e08c731f78426ca37681.png";

  const handleReload = () => {
    window.location.reload();
  };
  
  const handleContactNutri = () => {
    if (onContact) onContact();
    alert("🚧 Funcionalidade de contato direto em desenvolvimento. Por favor, tente recarregar a página ou entre em contato com sua nutri por outros meios se o problema persistir.");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-destructive/10 to-destructive/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-2 border-destructive/50">
          <CardHeader className="text-center">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto mb-6 w-32 h-32"
            >
              <img src={errorImageUrl} alt="Bonequinha triste com engrenagem quebrada" className="w-full h-full object-contain" />
            </motion.div>
            <CardTitle className="text-3xl font-bold text-destructive flex items-center justify-center">
              <AlertTriangle className="mr-3 w-8 h-8" /> Ops, algo deu errado!
            </CardTitle>
            <CardDescription className="text-destructive/80 mt-2">
              Parece que encontramos um probleminha técnico.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-muted-foreground">
              Não se preocupe, essas coisas acontecem! Às vezes, uma simples atualização da página resolve.
            </p>
            {(error || errorInfo) && (
              <details className="text-xs text-muted-foreground bg-muted/50 p-2 rounded text-left">
                <summary className="cursor-pointer font-medium text-destructive/70">Detalhes técnicos (opcional)</summary>
                <pre className="mt-1 whitespace-pre-wrap break-all">
                  {error?.toString()}
                  {errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleReload} className="bg-primary hover:bg-primary/90 flex-1">
                <RefreshCw className="mr-2 h-4 w-4" /> Tentar Novamente
              </Button>
              <Button onClick={handleContactNutri} variant="outline" className="border-primary text-primary hover:bg-primary/10 flex-1">
                <MessageSquare className="mr-2 h-4 w-4" /> Falar com a Nutri
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Se o problema persistir, entre em contato com o suporte ou sua nutricionista.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ErrorScreen;