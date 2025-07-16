
import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import DCCCommunity from '@/components/community/DCCCommunity';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminTabs from '@/components/admin/AdminTabs';
import AppSettingsManager from '@/components/admin/AppSettingsManager';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Settings, Loader2 } from 'lucide-react';
import { getAllPatients } from '@/lib/database';
import AdminNewsScreen from '@/components/admin/AdminNewsScreen';

const AdminDashboard = ({ onLogout }) => {
  const { user, profile, loading: authLoading } = useAuth();
  console.log("AdminDashboard - Profile:", profile);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalPatients: 0,
    newPatients: 0,
    pendingApproval: 0,
    totalAppointments: 0,
    communityPosts: 0,
    communityInteractions: 0,
  });
  const [patients, setPatients] = useState([]);
  const [showDCCCommunity, setShowDCCCommunity] = useState(false);
  const [showAppSettings, setShowAppSettings] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showAdminNews, setShowAdminNews] = useState(false); // Inicia como false
  const { toast } = useToast();

  useEffect(() => {
    // Verifica se há novas mensagens ou novidades para exibir
    // Esta lógica pode precisar ser ajustada com base em como 'novas mensagens' são definidas
    // Por enquanto, vamos exibir apenas se houver um motivo explícito
    // ou se for a primeira vez que o admin loga na sessão.
    const hasNewMessages = profile?.has_new_messages; // Exemplo: assumindo que o perfil tem um campo para isso
    const hasUnseenNews = profile?.has_unseen_news; // Exemplo: assumindo que o perfil tem um campo para isso

    if (hasNewMessages || hasUnseenNews) {
      setShowAdminNews(true);
    }
  }, [profile]);

  const loadDashboardData = useCallback(async () => {
    if (!profile || !profile.is_admin) return;
    setIsLoadingData(true);
    try {
      const patientsData = await getAllPatients();
      setPatients(patientsData || []);

      const { count: appointmentsCount, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id', { count: 'exact' });
      if (appointmentsError) throw appointmentsError;

      const { count: postsCount, error: postsError } = await supabase
        .from('dcc_posts')
        .select('id', { count: 'exact' });
      if (postsError) throw postsError;

      const { count: interactionsCount, error: interactionsError } = await supabase
        .from('dcc_interactions')
        .select('id', { count: 'exact' });
      if (interactionsError) throw interactionsError;

      setStats({
        totalPatients: patientsData.length || 0,
        pendingApproval: patientsData.filter(p => !p.is_approved).length,
        totalAppointments: appointmentsCount || 0,
        communityPosts: postsCount || 0,
        communityInteractions: interactionsCount || 0,
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Erro ao carregar dados do painel",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  }, [toast, profile]);

  useEffect(() => {
    if (!authLoading && profile) {
      loadDashboardData();
    }
  }, [loadDashboardData, authLoading, profile]);

  const handleNavigateToTab = (tabName) => {
    setActiveTab(tabName);
  };

  if (showDCCCommunity) {
    return <DCCCommunity user={user} onClose={() => setShowDCCCommunity(false)} isAdmin={true} />;
  }

  if (authLoading || isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
          <h2 className="text-xl font-semibold text-primary">Carregando painel da Nutri...</h2>
        </div>
      </div>
    );
  }

  if (showAdminNews) {
    return <AdminNewsScreen user={profile} onClose={() => setShowAdminNews(false)} />;
  }

  return (
    <>
      <AppSettingsManager show={showAppSettings} onClose={() => setShowAppSettings(false)} />
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 p-4">
        <div className="max-w-7xl mx-auto">
          <AdminHeader 
            onShowDCCCommunity={() => setShowDCCCommunity(true)}
            onLogout={onLogout}
          />
          
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowAppSettings(true)} variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Configurações do App
            </Button>
          </div>

          <AdminTabs 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            stats={stats}
            patients={patients}
            onNavigateToTab={handleNavigateToTab}
          />
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
