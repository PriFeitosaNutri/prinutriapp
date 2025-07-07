import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, Calendar, Trophy, Bell, FileText } from 'lucide-react';

const AdminOverview = ({ stats, onNavigateToTab }) => {
  const {
    patients = [],
    unreadMessages = 0,
    newAppointments = 0,
    communityStats = { activeUsers: 0 }
  } = stats || {};

  const safePatients = Array.isArray(patients) ? patients : [];
  
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
          <div className="text-2xl font-bold">{safePatients.length}</div>
          <p className="text-xs text-muted-foreground">
            {safePatients.filter(p => p.is_approved).length} aprovadas
          </p>
          <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto text-primary">
            Ver pacientes →
          </Button>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleCardClick('patients')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mensagens Não Lidas</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{unreadMessages}</div>
          <p className="text-xs text-muted-foreground">
            Requer atenção
          </p>
          {unreadMessages > 0 && (
            <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto text-red-600">
              <Bell className="w-3 h-3 mr-1" />
              Ver mensagens →
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleCardClick('appointments')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Novos Agendamentos</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{newAppointments}</div>
          <p className="text-xs text-muted-foreground">
            Para revisar
          </p>
          {newAppointments > 0 && (
            <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto text-blue-600">
              <FileText className="w-3 h-3 mr-1" />
              Ver agendamentos →
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleCardClick('dcc')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Comunidade DCC</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{communityStats.activeUsers}</div>
          <p className="text-xs text-muted-foreground">
            Usuárias ativas
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