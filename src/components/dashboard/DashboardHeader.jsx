import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Camera, Upload, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const DashboardHeader = ({ 
  user, 
  currentTaskPin, 
  userPhoto, 
  setUserPhoto,
  getDCCTrophy, 
  setShowDCCCommunity, 
  onLogout 
}) => {
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const { toast } = useToast();

  const handlePhotoUpload = () => {
    if (!photoUrl.trim()) {
      toast({
        title: "URL Necessária 📸",
        description: "Por favor, insira uma URL válida para sua foto!",
        variant: "destructive"
      });
      return;
    }

    // Validate if it's a valid URL
    try {
      new URL(photoUrl);
    } catch {
      toast({
        title: "URL Inválida 🚫",
        description: "Por favor, insira uma URL válida (ex: https://exemplo.com/foto.jpg)",
        variant: "destructive"
      });
      return;
    }

    // Save photo URL
    localStorage.setItem(`userPhoto_${user.email}_PriNutriApp`, photoUrl);
    setUserPhoto(photoUrl);
    setShowPhotoUpload(false);
    setPhotoUrl('');
    
    toast({
      title: "Foto Atualizada! ✨",
      description: "Sua foto foi salva com sucesso e aparecerá no app e na comunidade!",
      className: "bg-primary text-primary-foreground"
    });
  };

  const handleRemovePhoto = () => {
    localStorage.removeItem(`userPhoto_${user.email}_PriNutriApp`);
    setUserPhoto('');
    toast({
      title: "Foto Removida 🗑️",
      description: "Sua foto foi removida com sucesso!",
      className: "bg-accent text-accent-foreground"
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          {/* User Photo Space - now on the left side where the task pin was */}
          <div className="flex flex-col items-center">
            <div 
              className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg cursor-pointer hover:shadow-xl transition-shadow relative group"
              onClick={() => setShowPhotoUpload(true)}
            >
              {userPhoto ? (
                <>
                  <img src={userPhoto} alt="Sua foto" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <User className="w-6 h-6 text-white" />
                  <Camera className="w-3 h-3 text-white mt-1" />
                </div>
              )}
            </div>
            <span className="text-xs font-semibold text-primary mt-1">Você</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">Olá, {user.name}! 👋</h1>
            <p className="text-muted-foreground">Bem-vinda ao PriNutriApp!</p>
          </div>
        </div>
        
        {/* Right side - DCC button and Logout button stacked vertically on mobile */}
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
          {/* DCC Community Button - now with the task pin image (bonequinha com logo branca) */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center"
          >
            <Button
              onClick={() => setShowDCCCommunity(true)}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 p-0 shadow-lg border-4 border-white"
            >
              <img 
                src={currentTaskPin.image} 
                alt="DCC Community" 
                className="w-12 h-12 object-contain"
              />
            </Button>
            <span className="text-xs font-semibold text-primary mt-1">DCC</span>
          </motion.div>
          
          {/* Logout Button - now below DCC on mobile */}
          <Button 
            onClick={onLogout} 
            variant="outline" 
            className="border-primary text-primary hover:bg-primary/10 w-16 sm:w-auto"
            size="sm"
          >
            <LogOut className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>

      {/* Photo Upload Modal */}
      <AnimatePresence>
        {showPhotoUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <Camera className="w-5 h-5 mr-2" />
                      Adicionar Foto
                    </CardTitle>
                    <CardDescription>
                      Sua foto aparecerá no app e na comunidade DCC
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setShowPhotoUpload(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">URL da Foto:</label>
                  <Input
                    placeholder="https://exemplo.com/sua-foto.jpg"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handlePhotoUpload()}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Cole aqui o link da sua foto (pode ser do Google Fotos, Instagram, etc.)
                  </p>
                </div>
                
                {photoUrl && (
                  <div className="text-center">
                    <p className="text-sm font-medium mb-2">Prévia:</p>
                    <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-primary">
                      <img 
                        src={photoUrl} 
                        alt="Prévia da foto" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500" style={{display: 'none'}}>
                        Erro ao carregar
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  {userPhoto && (
                    <Button 
                      variant="outline" 
                      onClick={handleRemovePhoto}
                      className="flex-1"
                    >
                      Remover Foto
                    </Button>
                  )}
                  <Button 
                    onClick={handlePhotoUpload} 
                    className="flex-1"
                    disabled={!photoUrl.trim()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Salvar Foto
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardHeader;