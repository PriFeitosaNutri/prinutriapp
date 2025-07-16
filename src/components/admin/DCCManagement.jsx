
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, FileWarning, Trash2, Edit, Save, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const DCCManagement = ({ 
  communityStats, 
  weeklyRewards, 
  dccViolations, 
  onUpdateWeeklyReward, 
  onClearViolations 
}) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [rewardImage, setRewardImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const handleEdit = (index) => {
    setEditingIndex(index);
  };

  const handleSave = async (index) => {
    setEditingIndex(null);
    if(rewardImage) {
      await handleImageUpload(index);
    }
  };

  const handleFileChange = (e) => {
    if(e.target.files && e.target.files[0]) {
      setRewardImage(e.target.files[0]);
    }
  };
  
  const handleImageUpload = async (index) => {
    if (!rewardImage) return;
    setUploading(true);

    try {
      const fileExt = rewardImage.name.split('.').pop();
      const fileName = `reward-week-${weeklyRewards[index].week}.${fileExt}`;
      const filePath = `rewards/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('community_media')
        .upload(filePath, rewardImage, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('community_media')
        .getPublicUrl(filePath);

      await onUpdateWeeklyReward(index, 'link', publicUrl);
      toast({ title: 'Selo de recompensa atualizado com sucesso!' });
    } catch(error) {
      toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' });
    } finally {
      setRewardImage(null);
      setUploading(false);
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Coluna 1: Estatísticas e Violações */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-primary"><Trophy className="w-6 h-6 mr-2"/>Estatísticas da Comunidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total de Postagens:</span>
              <Badge variant="secondary">{communityStats.totalPosts}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Total de Interações:</span>
              <Badge variant="secondary">{communityStats.totalInteractions}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-destructive"><FileWarning className="w-6 h-6 mr-2"/>Violações de Conteúdo</CardTitle>
          </CardHeader>
          <CardContent>
            {dccViolations.length > 0 ? (
              <div className="space-y-2">
                {dccViolations.map((violation, index) => (
                  <div key={index} className="text-sm p-2 bg-destructive/10 rounded-md">
                    <p><span className="font-semibold">{violation.user}</span> - {violation.reason}</p>
                    <p className="text-xs text-muted-foreground">{violation.postContent}</p>
                  </div>
                ))}
                <Button variant="destructive" size="sm" onClick={onClearViolations} className="w-full mt-4">
                  <Trash2 className="w-4 h-4 mr-2"/>
                  Limpar Violações
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma violação reportada. Tudo em ordem!</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Coluna 2: Recompensas Semanais */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Recompensas Semanais DCC</CardTitle>
            <CardDescription>Configure os prêmios para cada semana do desafio.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyRewards.map((reward, index) => (
                <Card key={reward.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-lg">Semana {reward.week}</h4>
                      {editingIndex === index ? (
                        <div className="space-y-2 mt-2">
                          <Input
                            placeholder="Título da recompensa"
                            value={reward.title}
                            onChange={(e) => onUpdateWeeklyReward(index, 'title', e.target.value)}
                          />
                          <Textarea
                            placeholder="Descrição da recompensa"
                            value={reward.description}
                            onChange={(e) => onUpdateWeeklyReward(index, 'description', e.target.value)}
                            rows={3}
                          />
                          <div className="flex items-center gap-2">
                            <Input 
                              id={`reward-image-upload-${index}`}
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              className="hidden"
                              accept="image/png, image/jpeg, image/webp"
                            />
                            <Button 
                              variant="outline"
                              onClick={() => document.getElementById(`reward-image-upload-${index}`).click()}
                              disabled={uploading}
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                {rewardImage ? 'Trocar Selo' : 'Carregar Selo'}
                            </Button>
                            {rewardImage && <span className="text-sm text-muted-foreground truncate">{rewardImage.name}</span>}
                            {reward.link && !rewardImage && (
                                <div className="flex items-center gap-2">
                                  <ImageIcon className="w-5 h-5 text-green-500" />
                                  <span className="text-sm text-green-600">Selo atual carregado.</span>
                                </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="font-bold">{reward.title}</p>
                          <p className="text-sm text-muted-foreground">{reward.description}</p>
                          {reward.link && (
                            <a href={reward.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                              Ver recompensa
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {editingIndex === index ? (
                        <Button size="sm" onClick={() => handleSave(index)} disabled={uploading}>
                          <Save className="w-4 h-4 mr-1"/>{uploading ? 'Salvando...' : 'Salvar'}
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(index)}>
                          <Edit className="w-4 h-4 mr-1"/>Editar
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DCCManagement;
