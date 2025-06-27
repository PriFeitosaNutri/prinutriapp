import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Trophy, Camera, Upload, X, UserCircle, Edit3 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const AdminHeader = ({ 
  onShowDCCCommunity, 
  onLogout 
}) => {
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [nutriNameInput, setNutriNameInput] = useState('');
  const [currentNutriPhoto, setCurrentNutriPhoto] = useState('');
  const [currentNutriName, setCurrentNutriName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const savedNutriPhoto = localStorage.getItem('nutriPhoto_PriNutriApp') || '';
    const savedNutriName = localStorage.getItem('nutriName_PriNutriApp') || 'Nutricionista';
    setCurrentNutriPhoto(savedNutriPhoto);
    setCurrentNutriName(savedNutriName);
    setPhotoUrlInput(savedNutriPhoto);
    setNutriNameInput(savedNutriName);
  }, []);

  const handlePhotoUpload = () => {
    if (!photoUrlInput.trim()) {
      toast({
        title: "URL Necessária 📸",
        description: "Por favor, insira uma URL válida para sua foto!",
        variant: "destructive"
      });
      return;
    }

    try {
      new URL(photoUrlInput);
    } catch {
      toast({
        title: "URL Inválida 🚫",
        description: "Por favor, insira uma URL válida (ex: https://exemplo.com/foto.jpg)",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem('nutriPhoto_PriNutriApp', photoUrlInput);
    setCurrentNutriPhoto(photoUrlInput);
    setShowPhotoUpload(false);
    
    toast({
      title: "Foto Atualizada! ✨",
      description: "Sua foto foi salva com sucesso e aparecerá na comunidade DCC!",
      className: "bg-primary text-primary-foreground"
    });
  };

  const handleNameSave = () => {
    if (!nutriNameInput.trim()) {
      toast({
        title: "Nome Necessário 📝",
        description: "Por favor, insira seu nome!",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem('nutriName_PriNutriApp', nutriNameInput);
    setCurrentNutriName(nutriNameInput);
    setShowNameEdit(false);
    
    toast({
      title: "Nome Atualizado! ✨",
      description: "Seu nome foi salvo com sucesso e aparecerá na comunidade DCC!",
      className: "bg-primary text-primary-foreground"
    });
  };

  const handleRemovePhoto = () => {
    localStorage.removeItem('nutriPhoto_PriNutriApp');
    setCurrentNutriPhoto('');
    setPhotoUrlInput('');
    toast({
      title: "Foto Removida 🗑️",
      description: "Sua foto foi removida com sucesso!",
      className: "bg-accent text-accent-foreground"
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
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    URL da Foto:
                  </label>
                  <Input
                    placeholder="https://exemplo.com/sua-foto.jpg"
                    value={photoUrlInput}
                    onChange={(e) => setPhotoUrlInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handlePhotoUpload()}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Cole aqui o link da sua foto.
                  </p>
                </div>
                
                {photoUrlInput && (
                  <div className="text-center">
                    <p className="text-sm font-medium mb-2">Prévia:</p>
                    <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-primary">
                      <img 
                        src={photoUrlInput} 
                        alt="Prévia da foto" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const errorPlaceholder = e.target.nextSibling;
                          if (errorPlaceholder) errorPlaceholder.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500" style={{display: 'none'}}>
                        Erro ao carregar
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  {currentNutriPhoto && (
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
                    disabled={!photoUrlInput.trim()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Salvar Foto
                  </Button>
                </div>
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