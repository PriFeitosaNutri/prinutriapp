import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarDays, Clock, Trash2, PlusCircle, Save, AlertTriangle, Loader2 } from 'lucide-react';
import { format, parseISO, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, setHours, setMinutes, isSameDay, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AppointmentManager = () => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState({});
  const [selectedMonthForAvailability, setSelectedMonthForAvailability] = useState(new Date());
  const [editingDate, setEditingDate] = useState(null);
  const [newTimeSlot, setNewTimeSlot] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const appointmentsPromise = supabase
        .from('appointments')
        .select('*')
        .order('appointment_datetime', { ascending: true });

      const availabilityPromise = supabase
        .from('nutri_availability')
        .select('*');

      const [{ data: appointmentsData, error: appointmentsError }, { data: availabilityData, error: availabilityError }] = await Promise.all([appointmentsPromise, availabilityPromise]);

      if (appointmentsError) throw appointmentsError;
      if (availabilityError) throw availabilityError;

      setAppointments(appointmentsData.map(app => ({...app, dateTime: parseISO(app.appointment_datetime)})));
      
      const schedule = availabilityData.reduce((acc, curr) => {
        acc[curr.date] = curr.available_times || [];
        return acc;
      }, {});
      setAvailability(schedule);

    } catch (error) {
      toast({ title: "Erro ao carregar dados da agenda", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveAvailability = async () => {
    const availabilityToSave = Object.entries(availability)
      .map(([date, times]) => ({
        date: date,
        available_times: times,
      }));

    const { error } = await supabase
      .from('nutri_availability')
      .upsert(availabilityToSave, { onConflict: 'date' });

    if (error) {
      toast({ title: "Erro ao salvar disponibilidade", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Disponibilidade Salva!", description: "Sua agenda foi atualizada com sucesso.", className: "bg-primary text-primary-foreground" });
      setEditingDate(null);
      setNewTimeSlot('');
    }
  };

  const handleMonthChangeForAvailability = (offset) => {
    setSelectedMonthForAvailability(prev => addMonths(prev, offset));
  };

  const addTimeToDate = (dateStr) => {
    if (!newTimeSlot.match(/^([01]\d|2[0-3]):([0-5]\d)$/)) {
      toast({ title: "Formato de Hora Inválido", description: "Por favor, use o formato HH:MM (ex: 09:00, 14:30).", variant: "destructive" });
      return;
    }
    setAvailability(prev => {
      const updatedDaySlots = [...new Set([...(prev[dateStr] || []), newTimeSlot])].sort();
      return { ...prev, [dateStr]: updatedDaySlots };
    });
    setNewTimeSlot('');
  };

  const removeTimeFromDate = (dateStr, timeToRemove) => {
    setAvailability(prev => {
      const updatedDaySlots = (prev[dateStr] || []).filter(time => time !== timeToRemove);
      const newAvailability = { ...prev, [dateStr]: updatedDaySlots };
      if (newAvailability[dateStr].length === 0) {
        delete newAvailability[dateStr];
      }
      return newAvailability;
    });
  };
  
  const cancelAppointment = async (appointmentId) => {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId);

    if (error) {
      toast({ title: "Erro ao cancelar agendamento", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Agendamento Cancelado", description: "O agendamento foi removido com sucesso.", className: "bg-destructive text-destructive-foreground" });
      loadData();
    }
  };

  const renderAvailabilityCalendar = () => {
    const monthStart = startOfMonth(selectedMonthForAvailability);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: endOfMonth(monthStart) });
    const today = new Date(); today.setHours(0,0,0,0);
    const bookedSlots = appointments.map(app => app.dateTime);

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Button onClick={() => handleMonthChangeForAvailability(-1)}>Mês Anterior</Button>
          <h3 className="text-xl font-semibold text-primary">{format(selectedMonthForAvailability, 'MMMM yyyy', { locale: ptBR })}</h3>
          <Button onClick={() => handleMonthChangeForAvailability(1)}>Próximo Mês</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {daysInMonth.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayOfWeek = getDay(day);
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const daySlotsFromAvailability = availability[dateStr] || [];
            const isDayInPast = isBefore(day, today);

            return (
              <Card key={dateStr} className={`${isWeekend ? 'bg-muted/50' : ''} ${editingDate === dateStr ? 'ring-2 ring-accent' : ''} ${isDayInPast ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex justify-between items-center">
                    <span>{format(day, 'dd/MM (EEE)', { locale: ptBR })}</span>
                    {!isDayInPast && (
                        <Button variant="ghost" size="sm" onClick={() => setEditingDate(editingDate === dateStr ? null : dateStr)}>
                        {editingDate === dateStr ? 'Fechar' : 'Editar'}
                        </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editingDate === dateStr && !isDayInPast ? (
                    <div className="space-y-2">
                      {daySlotsFromAvailability.map(time => {
                        const slotDateTime = setMinutes(setHours(day, parseInt(time.split(':')[0])), parseInt(time.split(':')[1]));
                        const isBooked = bookedSlots.some(bookedSlot => isSameDay(bookedSlot, slotDateTime) && bookedSlot.getHours() === slotDateTime.getHours() && bookedSlot.getMinutes() === slotDateTime.getMinutes());
                        return (
                            <div key={time} className={`flex justify-between items-center text-sm p-1 rounded ${isBooked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            <span className={isBooked ? 'line-through' : ''}>{time} {isBooked ? "(Agendado)" : ""}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => removeTimeFromDate(dateStr, time)} disabled={isBooked}>
                                <Trash2 size={14}/>
                            </Button>
                            </div>
                        );
                      })}
                      <div className="flex gap-2 items-center pt-2 border-t">
                        <Input type="time" value={newTimeSlot} onChange={e => setNewTimeSlot(e.target.value)} className="h-8 text-sm"/>
                        <Button size="sm" onClick={() => addTimeToDate(dateStr)} className="h-8"><PlusCircle size={16} className="mr-1"/>Adicionar</Button>
                      </div>
                    </div>
                  ) : (
                    daySlotsFromAvailability.length > 0 ? (
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {daySlotsFromAvailability.map(time => {
                            const slotDateTime = setMinutes(setHours(day, parseInt(time.split(':')[0])), parseInt(time.split(':')[1]));
                            const isBooked = bookedSlots.some(bookedSlot => isSameDay(bookedSlot, slotDateTime) && bookedSlot.getHours() === slotDateTime.getHours() && bookedSlot.getMinutes() === slotDateTime.getMinutes());
                            return <li key={time} className={isBooked ? 'text-red-600 line-through' : 'text-green-700'}>{time} {isBooked ? "(Agendado)" : ""}</li>;
                        })}
                      </ul>
                    ) : <p className="text-xs text-muted-foreground">Nenhum horário definido.</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        {editingDate && <Button onClick={saveAvailability} className="mt-4 w-full"><Save className="mr-2"/>Salvar Alterações na Disponibilidade</Button>}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center"><CalendarDays className="mr-2"/>Gerenciar Disponibilidade</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center p-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Carregando agenda...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center"><CalendarDays className="mr-2"/>Gerenciar Disponibilidade</CardTitle>
          <CardDescription>Defina os dias e horários que você estará disponível para atendimentos. Horários agendados aparecerão em vermelho.</CardDescription>
        </CardHeader>
        <CardContent>
          {renderAvailabilityCalendar()}
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center"><Clock className="mr-2"/>Próximos Agendamentos</CardTitle>
          <CardDescription>Visualize os bate-papos iniciais agendados pelas pacientes.</CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments
                .sort((a,b) => a.dateTime - b.dateTime)
                .map(app => (
                <Card key={app.id} className="bg-card border p-4 rounded-lg shadow">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                      <p className="font-semibold text-lg text-primary">{app.patient_name}</p>
                      <p className="text-sm text-muted-foreground">{app.patient_email}</p>
                    </div>
                    <div className="mt-2 sm:mt-0 text-right">
                      <p className="text-md font-medium">{format(app.dateTime, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                      <p className="text-xs text-muted-foreground">Duração: {app.duration_minutes} min</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t flex justify-end">
                     <Button variant="destructive" size="sm" onClick={() => cancelAppointment(app.id)}>
                        <Trash2 className="w-4 h-4 mr-2"/>Cancelar Agendamento
                     </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-3"/>
              <p className="text-muted-foreground">Nenhum agendamento encontrado.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentManager;