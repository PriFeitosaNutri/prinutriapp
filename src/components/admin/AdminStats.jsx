import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, MessageSquare, Calendar, Trophy } from 'lucide-react';

const AdminStats = ({ patients, unreadMessages, newAppointments, communityViolations }) => {
  const statsData = [
    {
      title: 'Total de Pacientes',
      value: patients.length,
      icon: Users,
      color: 'text-primary'
    },
    {
      title: 'Mensagens Não Lidas',
      value: unreadMessages,
      icon: MessageSquare,
      color: 'text-blue-500'
    },
    {
      title: 'Novos Agendamentos',
      value: newAppointments,
      icon: Calendar,
      color: 'text-green-500'
    },
    {
      title: 'Violações DCC',
      value: communityViolations.length,
      icon: Trophy,
      color: 'text-yellow-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {statsData.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminStats;