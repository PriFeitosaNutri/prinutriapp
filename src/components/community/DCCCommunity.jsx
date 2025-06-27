import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Users, Target, BookOpen, 
  Edit3, Save, X, User, Camera
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { CommunityTab, MetaTab, DiaryTab } from '@/components/community/DCCCommunityTabs';

const DCCCommunity = ({ user, onClose, isAdmin = false }) => {
  const [activeTab, setActiveTab] = useState('community');
  const [posts, setPosts] = useState([]);
  const [communityProgress, setCommunityProgress] = useState(0);
  const [weeklyRewards, setWeeklyRewards] = useState([]);
  const [userProfile, setUserProfile] = useState({ 
    name: isAdmin ? (localStorage.getItem('nutriName_PriNutriApp') || 'Nutricionista') : user.name, 
    avatar: '', 
    bio: isAdmin ? 'Administradora da Comunidade' : '' 
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [diaryEntry, setDiaryEntry] = useState('');
  const [ranking, setRanking] = useState([]);
  const [userPhoto, setUserPhoto] = useState('');
  const [nutriPhotoState, setNutriPhotoState] = useState('');
  const { toast } = useToast();
  const normalizedUserEmail = user ? user.email.toLowerCase().trim() : null;

  useEffect(() => {
    loadCommunityData();
    calculateCommunityProgress();
    loadWeeklyRewards();
    loadUserProfile();
    loadRanking();
    
    if (!isAdmin && normalizedUserEmail) {
      const savedPhoto = localStorage.getItem(`userPhoto_${normalizedUserEmail}_PriNutriApp`) || '';
      setUserPhoto(savedPhoto);
    }
    
    const savedNutriPhoto = localStorage.getItem('nutriPhoto_PriNutriApp') || '';
    setNutriPhotoState(savedNutriPhoto);
    
    const photoUpdateInterval = setInterval(() => {
        const updatedNutriPhoto = localStorage.getItem('nutriPhoto_PriNutriApp') || '';
        const updatedNutriName = localStorage.getItem('nutriName_PriNutriApp') || 'Nutricionista';
        
        if(updatedNutriPhoto !== nutriPhotoState) {
            setNutriPhotoState(updatedNutriPhoto);
        }
        
        if (isAdmin && updatedNutriName !== userProfile.name) {
            setUserProfile(prev => ({ ...prev, name: updatedNutriName }));
        }
        
        if (!isAdmin && normalizedUserEmail) {
            const updatedUserPhoto = localStorage.getItem(`userPhoto_${normalizedUserEmail}_PriNutriApp`) || '';
            if(updatedUserPhoto !== userPhoto) {
                setUserPhoto(updatedUserPhoto);
            }
        }
    }, 2000);

    return () => clearInterval(photoUpdateInterval);

  }, [user, isAdmin, normalizedUserEmail, nutriPhotoState, userPhoto, userProfile.name]);

  const loadCommunityData = () => {
    const savedPosts = localStorage.getItem('dccCommunityPosts_PriNutriApp');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    }
  };

  const loadUserProfile = () => {
    if (isAdmin) {
      const savedNutriName = localStorage.getItem('nutriName_PriNutriApp') || 'Nutricionista';
      setUserProfile(prev => ({ ...prev, name: savedNutriName }));
      return;
    }
    
    if (!normalizedUserEmail) return;
    const savedProfile = localStorage.getItem(`dccUserProfile_${normalizedUserEmail}_PriNutriApp`);
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    } else {
       setUserProfile(prev => ({ ...prev, name: user.name, bio: ''}));
    }
  };

  const loadWeeklyRewards = () => {
    const savedRewards = localStorage.getItem('dccWeeklyRewards_PriNutriApp');
    if (savedRewards) {
      setWeeklyRewards(JSON.parse(savedRewards));
    } else {
      const defaultRewards = [
        { week: 1, type: 'pins', title: 'Selos Digitais', description: 'Coleção especial de pins', unlocked: false, progress: 0 },
        { week: 2, type: 'materials', title: 'Materiais Extras', description: 'PDFs e planners exclusivos', unlocked: false, progress: 0 },
        { week: 3, type: 'masterclass', title: 'Masterclass Ao Vivo', description: 'Sessão exclusiva com a nutri', unlocked: false, progress: 0, link: '' },
        { week: 4, type: 'bonus', title: 'Bônus Surpresa', description: 'Recompensa especial!', unlocked: false, progress: 0 }
      ];
      setWeeklyRewards(defaultRewards);
      localStorage.setItem('dccWeeklyRewards_PriNutriApp', JSON.stringify(defaultRewards));
    }
  };

  const loadRanking = () => {
    const allUsers = [];
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith('dccInteractions_') && key.endsWith('_PriNutriApp')) {
        const email = key.split('_')[1];
        const interactions = JSON.parse(localStorage.getItem(key)) || [];
        
        if (email === 'admin@prinutriapp.com' || email === 'suportefitlindaoficial@gmail.com') return;

        const existingUser = allUsers.find(u => u.email === email);
        if (existingUser) {
          existingUser.totalInteractions += interactions.length;
        } else {
          const profileKey = `dccUserProfile_${email}_PriNutriApp`;
          const profileData = localStorage.getItem(profileKey);
          const profile = profileData ? JSON.parse(profileData) : {};
          
          const userAccountKey = `userAccount_${email}_PriNutriApp`;
          const accountData = localStorage.getItem(userAccountKey);
          const account = accountData ? JSON.parse(accountData) : {};

          const userPhotoKey = `userPhoto_${email}_PriNutriApp`;
          const userPhotoUrl = localStorage.getItem(userPhotoKey) || '';
          
          allUsers.push({
            email,
            name: profile.name || account.name || email.split('@')[0],
            avatar: userPhotoUrl,
            totalInteractions: interactions.length
          });
        }
      }
    });

    const sortedUsers = allUsers.sort((a, b) => b.totalInteractions - a.totalInteractions).slice(0, 10);
    setRanking(sortedUsers);
  };

  const calculateCommunityProgress = () => {
    const today = new Date().toDateString();
    const globalInteractions = JSON.parse(localStorage.getItem(`globalDCCInteractions_${today}_PriNutriApp`)) || [];
    const weeklyGoal = 100;
    const progress = Math.min((globalInteractions.length / weeklyGoal) * 100, 100);
    setCommunityProgress(progress);
  };

  const handleSaveDiaryEntry = () => {
    if (isAdmin || !diaryEntry.trim() || !normalizedUserEmail) return;

    const entry = {
      id: Date.now(),
      content: diaryEntry,
      timestamp: new Date().toISOString(),
      shared: false
    };

    const savedEntries = JSON.parse(localStorage.getItem(`dccDiaryEntries_${normalizedUserEmail}_PriNutriApp`) || '[]');
    savedEntries.unshift(entry);
    localStorage.setItem(`dccDiaryEntries_${normalizedUserEmail}_PriNutriApp`, JSON.stringify(savedEntries));
    
    setDiaryEntry('');
    toast({
      title: "Reflexão Salva! 📖",
      description: "Sua reflexão foi salva no seu diário pessoal.",
      className: "bg-accent text-accent-foreground"
    });
  };

  const handleShareDiaryEntry = () => {
    if (isAdmin || !diaryEntry.trim() || !normalizedUserEmail) return;

    const post = {
      id: Date.now(),
      author: userProfile.name,
      authorEmail: normalizedUserEmail,
      authorAvatar: userPhoto, 
      content: diaryEntry,
      category: 'desabafos',
      timestamp: new Date().toISOString(),
      likes: [],
      comments: [],
      isDiaryEntry: true
    };

    const updatedPosts = [post, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem('dccCommunityPosts_PriNutriApp', JSON.stringify(updatedPosts));
    
    handleSaveDiaryEntry();
    
    toast({
      title: "Reflexão Compartilhada! 💫",
      description: "Sua reflexão foi compartilhada com a comunidade!",
      className: "bg-primary text-primary-foreground"
    });
  };

  const saveUserProfile = () => {
    if (isAdmin || !normalizedUserEmail) return;
    localStorage.setItem(`dccUserProfile_${normalizedUserEmail}_PriNutriApp`, JSON.stringify(userProfile));
    setEditingProfile(false);
    toast({
      title: "Perfil Atualizado! ✨",
      description: "Suas informações foram salvas com sucesso!",
      className: "bg-primary text-primary-foreground"
    });
  };

  const displayUserPhoto = isAdmin ? nutriPhotoState : userPhoto;
  const displayUserName = isAdmin ? userProfile.name : userProfile.name;
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
                    displayUserName.charAt(0).toUpperCase()
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
              <DiaryTab 
                diaryEntry={diaryEntry}
                setDiaryEntry={setDiaryEntry}
                handleSaveDiaryEntry={handleSaveDiaryEntry}
                handleShareDiaryEntry={handleShareDiaryEntry}
                user={user}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default DCCCommunity;