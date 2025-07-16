import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, Calendar, Calculator, 
  TrendingUp, Trophy, ExternalLink
} from 'lucide-react';
import PatientList from '@/components/admin/PatientList';
import AppointmentManager from '@/components/admin/AppointmentManager';
import NutritionalCalculators from '@/components/admin/NutritionalCalculators';
import AdminOverview from '@/components/admin/AdminOverview';
import DCCManagement from '@/components/admin/DCCManagement';
import ConsultationLinkManager from '@/components/admin/ConsultationLinkManager';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AdminTabs = ({
  activeTab,
  setActiveTab,
  stats,
  patients,
  onNavigateToTab,
}) => {
  const [weeklyRewards, setWeeklyRewards] = useState([]);
  const [dccViolations, setDccViolations] = useState([]);
  const [consultationLink, setConsultationLink] = useState('');
  const { toast } = useToast();

  const loadDCCData = useCallback(async () => {
    try {
      const { data: rewards, error: rewardsError } = await supabase
        .from('dcc_weekly_rewards')
        .select('*')
        .order('week', { ascending: true });

      if (rewardsError) throw rewardsError;
      setWeeklyRewards(rewards || []);

    } catch (error) {
      console.error('Error loading DCC data:', error);
    }
  }, []);

  const loadConsultationLink = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'consultation_link')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setConsultationLink(data?.value || '');
    } catch (error) {
      console.error('Error loading consultation link:', error);
    }
  }, []);

  useEffect(() => {
    loadDCCData();
    loadConsultationLink();
  }, [loadDCCData, loadConsultationLink]);

  const handleUpdateWeeklyReward = async (index, field, value) => {
    const updatedRewards = [...weeklyRewards];
    updatedRewards[index] = {
      ...updatedRewards[index],
      [field]: value
    };
    setWeeklyRewards(updatedRewards);

    try {
      const { error } = await supabase
        .from('dcc_weekly_rewards')
        .upsert(updatedRewards[index], { onConflict: 'week' });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating reward:', error);
      toast({
        title: "Erro ao atualizar recompensa",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleClearViolations = () => {
    setDccViolations([]);
    toast({
      title: "Violações Limpas! ✅",
      description: "Todas as violações foram removidas.",
      className: "bg-green-500 text-white"
    });
  };

  const handleLinkChange = (newLink) => {
    setConsultationLink(newLink);
  };

  const handleSaveLink = async () => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ key: 'consultation_link', value: consultationLink }, { onConflict: 'key' });

      if (error) throw error;

      toast({
        title: "Link Salvo! ✅",
        description: "O link de consulta foi atualizado com sucesso.",
        className: "bg-green-500 text-white"
      });
    } catch (error) {
      console.error('Error saving consultation link:', error);
      toast({
        title: "Erro ao salvar link",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Visão Geral
        </TabsTrigger>
        <TabsTrigger value="patients" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Pacientes
        </TabsTrigger>
        <TabsTrigger value="appointments" className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Agendamentos
        </TabsTrigger>
        <TabsTrigger value="calculations" className="flex items-center gap-2">
          <Calculator className="w-4 h-4" />
          Cálculos
        </TabsTrigger>
        <TabsTrigger value="dcc" className="flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          DCC
        </TabsTrigger>
        <TabsTrigger value="consultation" className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          Consulta
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <AdminOverview 
          stats={stats}
          onNavigateToTab={onNavigateToTab}
        />
      </TabsContent>

      <TabsContent value="patients">
        <PatientList patients={patients} />
      </TabsContent>

      <TabsContent value="appointments">
        <AppointmentManager />
      </TabsContent>

      <TabsContent value="calculations">
        <NutritionalCalculators />
      </TabsContent>

      <TabsContent value="dcc">
        <DCCManagement 
          communityStats={{
            totalPosts: stats.communityPosts,
            totalInteractions: stats.communityInteractions,
            activeUsers: 0
          }}
          weeklyRewards={weeklyRewards}
          dccViolations={dccViolations}
          onUpdateWeeklyReward={handleUpdateWeeklyReward}
          onClearViolations={handleClearViolations}
        />
      </TabsContent>

      <TabsContent value="consultation">
        <ConsultationLinkManager 
          consultationLink={consultationLink}
          onLinkChange={handleLinkChange}
          onSaveLink={handleSaveLink}
        />
      </TabsContent>
    </Tabs>
  );
};

export default AdminTabs;