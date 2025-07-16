import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { getAppSetting, setAppSetting } from '@/lib/database';
import { motion } from 'framer-motion';
import { Settings, X, Save } from 'lucide-react';

const AppSettingsManager = ({ show, onClose }) => {
  const [welcomeVideoUrl, setWelcomeVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const setting = await getAppSetting('welcome_video');
      if (setting && setting.url) {
        setWelcomeVideoUrl(setting.url);
      }
    } catch (error) {
      toast({
        title: "Erro ao buscar configurações",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (show) {
      fetchSettings();
    }
  }, [show, fetchSettings]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await setAppSetting('welcome_video', { url: welcomeVideoUrl });
      toast({
        title: "Configurações salvas!",
        description: "A URL do vídeo de boas-vindas foi atualizada.",
        className: "bg-primary text-primary-foreground",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="shadow-2xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-primary" />
                <div>
                  <CardTitle>Configurações do Aplicativo</CardTitle>
                  <CardDescription>Altere configurações globais do sistema.</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="welcome-video-url" className="text-base">URL do Vídeo de Boas-Vindas</Label>
              <p className="text-sm text-muted-foreground">
                Cole aqui a URL completa do vídeo do YouTube (formato "embed").
              </p>
              <Input
                id="welcome-video-url"
                placeholder="https://www.youtube.com/embed/..."
                value={welcomeVideoUrl}
                onChange={(e) => setWelcomeVideoUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? 'Salvando...' : <><Save className="w-4 h-4 mr-2" /> Salvar Alterações</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AppSettingsManager;