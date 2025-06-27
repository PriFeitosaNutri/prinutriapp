import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import DCCCommunity from '@/components/community/DCCCommunity';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminTabs from '@/components/admin/AdminTabs';
import AppSettingsManager from '@/components/admin/AppSettingsManager';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

const AdminDashboard = ({ onLogout }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalPatients: 0,
    newPatients: 0,
    pendingApproval: 0,
    totalAppointments: 0,
    communityPosts: 0,
    communityInteractions: 0,
  });
  const [showDCCCommunity, setShowDCCCommunity] = useState(false);
  const [showAppSettings, setShowAppSettings] = useState(false);
  const { toast } = useToast();

  const loadDashboardData = useCallback(async () => {
    try {
      const { data: patients, error: patientsError } = await supabase
        .from('profiles')
        .select('id, is_approved', { count: 'exact' })
        .eq('is_admin', false);
      if (patientsError) throw patientsError;

      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id', { count: 'exact' });
      if (appointmentsError) throw appointmentsError;

      const { data: posts, error: postsError } = await supabase
        .from('dcc_posts')
        .select('id', { count: 'exact' });
      if (postsError) throw postsError;

      const { data: interactions, error: interactionsError } = await supabase
        .from('dcc_interactions')
        .select('id', { count: 'exact' });
      if (interactionsError) throw interactionsError;

      setStats({
        totalPatients: patients.length,
        pendingApproval: patients.filter(p => !p.is_approved).length,
        totalAppointments: appointments.length,
        communityPosts: posts.length,
        communityInteractions: interactions.length,
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Erro ao carregar dados do painel",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleNavigateToTab = (tabName) => {
    setActiveTab(tabName);
  };

  if (showDCCCommunity) {
    return <DCCCommunity user={user} onClose={() => setShowDCCCommunity(false)} isAdmin={true} />;
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
            onNavigateToTab={handleNavigateToTab}
          />
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;