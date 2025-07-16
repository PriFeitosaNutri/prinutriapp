import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, Calendar, Trophy, Bell, FileText } from 'lucide-react';

const AdminOverview = ({ stats, onNavigateToTab }) => {
  const {
    totalPatients = 0,
    pendingApproval = 0,
    totalAppointments = 0,
    communityPosts = 0,
    communityInteractions = 0
  } = stats || {};
  
  const handleCardClick = (tabName) => {
    if (onNavigateToTab) {
      onNavigateToTab(tabName);
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleCardClick('patients')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPatients}</div>
          <p className="text-xs text-muted-foreground">
            {pendingApproval} pendentes de aprovação
          </p>
          <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto text-primary">
            Ver pacientes →
          </Button>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleCardClick('patients')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pacientes Pendentes</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{pendingApproval}</div>
          <p className="text-xs text-muted-foreground">
            Aguardando aprovação
          </p>
          {pendingApproval > 0 && (
            <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto text-red-600">
              <Bell className="w-3 h-3 mr-1" />
              Ver pacientes →
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleCardClick('appointments')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Agendamentos</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{totalAppointments}</div>
          <p className="text-xs text-muted-foreground">
            Agendamentos realizados
          </p>
          <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto text-blue-600">
            <FileText className="w-3 h-3 mr-1" />
            Ver agendamentos →
          </Button>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleCardClick('dcc')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Comunidade DCC</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{communityPosts}</div>
          <p className="text-xs text-muted-foreground">
            Posts na comunidade
          </p>
          <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto text-purple-600">
            Gerenciar DCC →
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;