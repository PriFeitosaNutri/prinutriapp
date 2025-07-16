
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { 
  ArrowLeft, Users, Target, BookOpen, 
  Edit3, Save, X, User, Camera
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { CommunityTab, MetaTab, DiaryTab } from '@/components/community/DCCCommunityTabs';
import { getProfile, updateProfile } from '@/lib/database';

const DCCCommunity = ({ user, onClose, isAdmin = false }) => {
  const [activeTab, setActiveTab] = useState('community');
  const [communityProgress, setCommunityProgress] = useState(0);
  const [weeklyRewards, setWeeklyRewards] = useState([]);
  const [userProfile, setUserProfile] = useState({ name: user.name, bio: '' });
  const [editingProfile, setEditingProfile] = useState(false);
  const [ranking, setRanking] = useState([]);
  const [userPhoto, setUserPhoto] = useState(user.photo_url || '');
  const [nutriPhotoState, setNutriPhotoState] = useState('');
  const { toast } = useToast();

  const loadInitialData = useCallback(async () => {
    // Load community progress, rewards, ranking, etc.
    // This is a placeholder for actual data loading logic
    setCommunityProgress(Math.random() * 100);
    
    const { data: rewardsData, error: rewardsError } = await supabase.from('dcc_weekly_rewards').select('*').order('week');
    if (rewardsError) console.error("Error loading rewards:", rewardsError);
    else setWeeklyRewards(rewardsData || []);

    const { data: rankingData, error: rankingError } = await supabase.rpc('get_dcc_user_interactions_count');
    if(rankingError) console.error("Error loading ranking:", rankingError);
    else setRanking(rankingData || []);

    if (isAdmin) {
      const adminProfile = await getProfile(user.id);
      setNutriPhotoState(adminProfile?.photo_url || '');
      setUserProfile({ name: adminProfile?.name || "Nutricionista", bio: "Administradora da Comunidade" });
    } else {
      setUserProfile({ name: user.name, bio: user.bio || "Membro da comunidade DCC" });
      setUserPhoto(user.photo_url || '');
    }
  }, [isAdmin, user]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);


  const saveUserProfile = async () => {
    if (isAdmin) return;
    try {
      await updateProfile(user.id, { name: userProfile.name, bio: userProfile.bio });
      setEditingProfile(false);
      toast({
        title: "Perfil Atualizado! ✨",
        description: "Suas informações foram salvas com sucesso!",
        className: "bg-primary text-primary-foreground"
      });
    } catch(error) {
      toast({ title: "Erro", description: "Não foi possível salvar seu perfil.", variant: "destructive" });
    }
  };

  const displayUserPhoto = isAdmin ? nutriPhotoState : userPhoto;
  const displayUserName = userProfile.name;
  const displayUserBio = isAdmin ? 'Administradora da Comunidade' : (userProfile.bio || 'Membro da comunidade DCC');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <Button variant="ghost" onClick={onClose} className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-primary">Meta da Leveza: DCC</h1>
            <p className="text-sm text-muted-foreground">Desafio Coletivo do Cuidado</p>
          </div>
          <div className="w-20 hidden sm:block"></div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                  {displayUserPhoto ? (
                    <img src={displayUserPhoto} alt="Sua foto" className="w-full h-full object-cover" />
                  ) : (
                    displayUserName?.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{displayUserName}</h3>
                  <p className="text-sm text-muted-foreground">{displayUserBio}</p>
                </div>
              </div>
              {!isAdmin && (
                <Button variant="outline" size="sm" onClick={() => setEditingProfile(true)}>
                  <Edit3 className="w-4 h-4 mr-1" />
                  Editar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <AnimatePresence>
          {!isAdmin && editingProfile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Editar Perfil</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nome</label>
                    <Input
                      value={userProfile.name}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Bio</label>
                    <Textarea
                      placeholder="Conte um pouco sobre você..."
                      value={userProfile.bio}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, bio: e.target.value }))}
                    />
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      💡 <strong>Dica:</strong> Para alterar sua foto, vá até a tela principal do app e clique na sua foto de perfil!
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setEditingProfile(false)} className="flex-1">
                      Cancelar
                    </Button>
                    <Button onClick={saveUserProfile} className="flex-1">
                      Salvar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-2' : 'grid-cols-3'} mb-6`}>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Comunidade
            </TabsTrigger>
            <TabsTrigger value="meta" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Meta da Leveza
            </TabsTrigger>
            {!isAdmin && (
              <TabsTrigger value="diary" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Diário da Leveza
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="community">
            <CommunityTab 
              communityProgress={communityProgress}
              user={user}
              userPhoto={userPhoto}
              nutriPhoto={nutriPhotoState}
              toast={toast}
              isAdmin={isAdmin}
            />
          </TabsContent>

          <TabsContent value="meta">
            <MetaTab 
              communityProgress={communityProgress}
              weeklyRewards={weeklyRewards}
              ranking={ranking}
            />
          </TabsContent>

          {!isAdmin && (
            <TabsContent value="diary">
              <DiaryTab user={user} toast={toast} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default DCCCommunity;
