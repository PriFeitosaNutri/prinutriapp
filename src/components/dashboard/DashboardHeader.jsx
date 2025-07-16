
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Camera, Upload, X, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { updateProfile } from '@/lib/database';

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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const handleFileSelect = () => {
    fileInputRef.current.click();
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({ title: "Arquivo muito grande", description: "Por favor, escolha uma imagem menor que 5MB.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    const fileName = `${user.id}/${Date.now()}-${file.name}`;
    
    try {
      const { error: uploadError } = await supabase.storage
        .from('community_media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('community_media')
        .getPublicUrl(fileName);

      await updateProfile(user.id, { photo_url: publicUrl });
      setUserPhoto(publicUrl);
      
      toast({
        title: "Foto Atualizada! ✨",
        description: "Sua foto foi salva com sucesso!",
        className: "bg-primary text-primary-foreground"
      });
      setShowPhotoUpload(false);
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast({ title: "Erro no Upload", description: "Não foi possível enviar sua foto. Tente novamente.", variant: "destructive" });
    } finally {
      setIsUploading(false);
      event.target.value = null; // Reset file input
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await updateProfile(user.id, { photo_url: null });
      setUserPhoto('');
      toast({
        title: "Foto Removida 🗑️",
        description: "Sua foto foi removida com sucesso!",
        className: "bg-accent text-accent-foreground"
      });
      setShowPhotoUpload(false);
    } catch (error) {
      console.error("Error removing photo:", error);
      toast({ title: "Erro ao remover foto", description: error.message, variant: "destructive" });
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
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
        
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
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
                      Alterar Foto de Perfil
                    </CardTitle>
                    <CardDescription>
                      Escolha uma foto do seu dispositivo.
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
                <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary">
                  {userPhoto ? (
                    <img src={userPhoto} alt="Sua foto atual" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
                <Input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handlePhotoUpload}
                  disabled={isUploading}
                />
                <Button 
                  onClick={handleFileSelect} 
                  className="w-full"
                  disabled={isUploading}
                >
                  {isUploading ? 'Enviando...' : <><Upload className="w-4 h-4 mr-2" /> Escolher Foto</>}
                </Button>
                {userPhoto && (
                  <Button 
                    variant="destructive" 
                    onClick={handleRemovePhoto}
                    className="w-full"
                    disabled={isUploading}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Remover Foto
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardHeader;
