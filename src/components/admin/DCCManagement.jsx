
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Trophy, Gift, AlertTriangle, Save, Loader2 } from 'lucide-react';

const DCCManagement = ({ 
  communityStats, 
  weeklyRewards: initialWeeklyRewards = [], 
  dccViolations = [], 
  onUpdateWeeklyReward, 
  onClearViolations 
}) => {
  const [weeklyRewards, setWeeklyRewards] = useState(initialWeeklyRewards);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadWeeklyRewards();
  }, []);

  const loadWeeklyRewards = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('dcc_weekly_rewards')
        .select('*')
        .order('week', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setWeeklyRewards(data);
      } else {
        const defaultRewards = [
          { 
            week: 1, 
            type: 'pins', 
            title: 'Selos Digitais Exclusivos', 
            description: 'Coleção especial de pins e badges para sua jornada', 
            unlocked: false, 
            progress: 0,
            link: ''
          },
          { 
            week: 2, 
            type: 'materials', 
            title: 'Materiais Extras Premium', 
            description: 'PDFs exclusivos, planners e guias especiais', 
            unlocked: false, 
            progress: 0,
            link: ''
          },
          { 
            week: 3, 
            type: 'masterclass', 
            title: 'Masterclass Ao Vivo', 
            description: 'Sessão exclusiva e interativa com a nutricionista', 
            unlocked: false, 
            progress: 0,
            link: ''
          },
          { 
            week: 4, 
            type: 'bonus', 
            title: 'Bônus Surpresa Final', 
            description: 'Recompensa especial de conclusão do desafio!', 
            unlocked: false, 
            progress: 0,
            link: ''
          }
        ];
        setWeeklyRewards(defaultRewards);
        await saveDefaultRewards(defaultRewards);
      }
    } catch (error) {
      console.error('Error loading weekly rewards:', error);
      toast({
        title: "Erro ao carregar recompensas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveDefaultRewards = async (rewards) => {
    try {
      const { error } = await supabase
        .from('dcc_weekly_rewards')
        .upsert(rewards, { onConflict: 'week' });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving default rewards:', error);
    }
  };

  const handleUpdateReward = (index, field, value) => {
    const updatedRewards = [...weeklyRewards];
    updatedRewards[index] = {
      ...updatedRewards[index],
      [field]: value
    };
    setWeeklyRewards(updatedRewards);
  };

  const handleSaveRewards = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('dcc_weekly_rewards')
        .upsert(weeklyRewards, { onConflict: 'week' });

      if (error) throw error;

      toast({
        title: "Recompensas Salvas! ✅",
        description: "As configurações das recompensas semanais foram atualizadas com sucesso.",
        className: "bg-green-500 text-white"
      });
    } catch (error) {
      console.error('Error saving rewards:', error);
      toast({
        title: "Erro ao salvar recompensas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleUnlock = async (index) => {
    const updatedRewards = [...weeklyRewards];
    updatedRewards[index].unlocked = !updatedRewards[index].unlocked;
    setWeeklyRewards(updatedRewards);

    try {
      const { error } = await supabase
        .from('dcc_weekly_rewards')
        .update({ unlocked: updatedRewards[index].unlocked })
        .eq('week', updatedRewards[index].week);

      if (error) throw error;

      toast({
        title: updatedRewards[index].unlocked ? "Recompensa Desbloqueada! 🎉" : "Recompensa Bloqueada! 🔒",
        description: `Semana ${updatedRewards[index].week} foi ${updatedRewards[index].unlocked ? 'desbloqueada' : 'bloqueada'} para as pacientes.`,
        className: updatedRewards[index].unlocked ? "bg-green-500 text-white" : "bg-orange-500 text-white"
      });
    } catch (error) {
      console.error('Error toggling reward unlock:', error);
      toast({
        title: "Erro ao alterar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Carregando configurações da DCC...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
            Estatísticas da Comunidade DCC
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{communityStats?.totalPosts || 0}</div>
              <div className="text-sm text-muted-foreground">Posts Totais</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{communityStats?.totalInteractions || 0}</div>
              <div className="text-sm text-muted-foreground">Interações Totais</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{communityStats?.activeUsers || 0}</div>
              <div className="text-sm text-muted-foreground">Usuárias Ativas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Gift className="w-5 h-5 mr-2 text-pink-500" />
              Gerenciar Recompensas Semanais da DCC
            </span>
            <Button 
              onClick={handleSaveRewards} 
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Todas as Recompensas
            </Button>
          </CardTitle>
          <CardDescription>
            Configure as recompensas que serão liberadas a cada semana do Desafio Coletivo do Cuidado (DCC)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {weeklyRewards.map((reward, index) => (
              <div key={reward.week} className="p-6 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-primary">Semana {reward.week}</h3>
                  <div className="flex items-center gap-3">
                    <Badge variant={reward.unlocked ? "default" : "secondary"} className="text-sm">
                      {reward.unlocked ? "✅ Desbloqueada" : "🔒 Bloqueada"}
                    </Badge>
                    <Button
                      size="sm"
                      variant={reward.unlocked ? "destructive" : "default"}
                      onClick={() => handleToggleUnlock(index)}
                    >
                      {reward.unlocked ? "Bloquear" : "Desbloquear"}
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Título da Recompensa</label>
                    <Input
                      value={reward.title || ''}
                      onChange={(e) => handleUpdateReward(index, 'title', e.target.value)}
                      placeholder="Ex: Materiais Exclusivos"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Tipo de Recompensa</label>
                    <select
                      value={reward.type || 'materials'}
                      onChange={(e) => handleUpdateReward(index, 'type', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="pins">🏆 Selos Digitais</option>
                      <option value="materials">📚 Materiais Extras</option>
                      <option value="masterclass">🎥 Masterclass</option>
                      <option value="bonus">🎁 Bônus Especial</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Descrição da Recompensa</label>
                  <Textarea
                    value={reward.description || ''}
                    onChange={(e) => handleUpdateReward(index, 'description', e.target.value)}
                    placeholder="Descreva o que as pacientes vão receber nesta semana..."
                    rows={3}
                    className="w-full"
                  />
                </div>

                {reward.type === 'masterclass' && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Link da Masterclass</label>
                    <Input
                      value={reward.link || ''}
                      onChange={(e) => handleUpdateReward(index, 'link', e.target.value)}
                      placeholder="https://zoom.us/j/... ou https://youtube.com/..."
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Cole aqui o link do Zoom, YouTube ou plataforma onde será realizada a masterclass
                    </p>
                  </div>
                )}

                {reward.type === 'materials' && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Link dos Materiais</label>
                    <Input
                      value={reward.link || ''}
                      onChange={(e) => handleUpdateReward(index, 'link', e.target.value)}
                      placeholder="https://drive.google.com/... ou link para download"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Cole aqui o link do Google Drive, Dropbox ou onde estão os materiais
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">💡 Como Funciona:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• As recompensas aparecem para as pacientes conforme você as desbloqueia</li>
              <li>• Use o botão "Desbloquear" quando quiser liberar uma semana</li>
              <li>• Para masterclasses, adicione o link e as pacientes poderão acessar diretamente</li>
              <li>• Lembre-se de salvar as alterações clicando em "Salvar Todas as Recompensas"</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {dccViolations && dccViolations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                Violações da Comunidade ({dccViolations.length})
              </span>
              <Button variant="outline" size="sm" onClick={onClearViolations}>
                Limpar Todas
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dccViolations.slice(0, 5).map((violation, index) => (
                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-red-800">{violation.userName}</span>
                    <span className="text-xs text-red-600">
                      {new Date(violation.timestamp).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm text-red-700">{violation.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DCCManagement;
