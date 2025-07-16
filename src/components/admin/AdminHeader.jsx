
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Trophy, Camera, Upload, X, UserCircle, Edit3, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile } from '@/lib/database';

const AdminHeader = ({ 
  onShowDCCCommunity, 
  onLogout 
}) => {
  const { profile } = useAuth();
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [nutriNameInput, setNutriNameInput] = useState('');
  const [currentNutriPhoto, setCurrentNutriPhoto] = useState('');
  const [currentNutriName, setCurrentNutriName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      setCurrentNutriPhoto(profile.photo_url || '');
      setCurrentNutriName(profile.name || 'Nutricionista');
      setNutriNameInput(profile.name || 'Nutricionista');
    }
  }, [profile]);

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
    const fileName = `${profile.id}/${Date.now()}-${file.name}`;
    
    try {
      const { error: uploadError } = await supabase.storage
        .from('community_media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('community_media')
        .getPublicUrl(fileName);

      await updateProfile(profile.id, { photo_url: publicUrl });
      setCurrentNutriPhoto(publicUrl);
      
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
      await updateProfile(profile.id, { photo_url: null });
      setCurrentNutriPhoto('');
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

  const handleNameSave = async () => {
    if (!nutriNameInput.trim()) {
      toast({
        title: "Nome Necessário 📝",
        description: "Por favor, insira seu nome!",
        variant: "destructive"
      });
      return;
    }

    await updateProfile(profile.id, { name: nutriNameInput });
    setCurrentNutriName(nutriNameInput);
    setShowNameEdit(false);
    
    toast({
      title: "Nome Atualizado! ✨",
      description: "Seu nome foi salvo com sucesso!",
      className: "bg-primary text-primary-foreground"
    });
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <div 
              className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg cursor-pointer hover:shadow-xl transition-shadow relative group"
              onClick={() => setShowPhotoUpload(true)}
            >
              {currentNutriPhoto ? (
                <>
                  <img src={currentNutriPhoto} alt="Foto da Nutricionista" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <UserCircle className="w-8 h-8 text-white" />
                  <Camera className="w-3 h-3 text-white mt-1" />
                </div>
              )}
            </div>
            <span className="text-xs font-semibold text-primary mt-1">Perfil</span>
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-primary">Painel da {currentNutriName}</h1>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowNameEdit(true)}
                className="p-1 h-auto"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-muted-foreground">Gerencie suas pacientes e conteúdos</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button 
            onClick={onShowDCCCommunity}
            className="bg-purple-500 hover:bg-purple-600 text-white flex-1 sm:flex-none"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Acessar Comunidade DCC
          </Button>
          <Button onClick={onLogout} variant="outline" className="border-primary text-primary hover:bg-primary/10">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
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
                      Foto de Perfil da Nutri
                    </CardTitle>
                    <CardDescription>
                      Sua foto aparecerá na comunidade DCC
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
                  {currentNutriPhoto ? (
                    <img src={currentNutriPhoto} alt="Sua foto atual" className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle className="w-12 h-12 text-muted-foreground" />
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
                {currentNutriPhoto && (
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

        {showNameEdit && (
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
                      <Edit3 className="w-5 h-5 mr-2" />
                      Nome da Nutricionista
                    </CardTitle>
                    <CardDescription>
                      Seu nome aparecerá na comunidade DCC
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setShowNameEdit(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Nome:
                  </label>
                  <Input
                    placeholder="Digite seu nome"
                    value={nutriNameInput}
                    onChange={(e) => setNutriNameInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleNameSave()}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowNameEdit(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleNameSave} 
                    className="flex-1"
                    disabled={!nutriNameInput.trim()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Salvar Nome
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

export default AdminHeader;
