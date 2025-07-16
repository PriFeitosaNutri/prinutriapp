
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, ChevronLeft, ChevronRight, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, getDay, parseISO, addMinutes, setHours, setMinutes, setSeconds, setMilliseconds, isBefore, isAfter, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const SchedulingScreen = ({ user, onScheduled, onCancel }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [nutriSchedule, setNutriSchedule] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const { toast } = useToast();

  const appointmentDuration = 50;
  const schedulingImageUrl = "/bonequinhanocelular.png";

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('appointment_datetime');
      if (appointmentsError) throw appointmentsError;
      setBookedSlots(appointments.map(app => parseISO(app.appointment_datetime)));

      const { data: availability, error: availabilityError } = await supabase
        .from('nutri_availability')
        .select('date, available_times');
      if (availabilityError) throw availabilityError;
      
      const schedule = availability.reduce((acc, curr) => {
        acc[curr.date] = curr.available_times;
        return acc;
      }, {});
      setNutriSchedule(schedule);

    } catch (error) {
      console.error("Error fetching schedule data:", error);
      toast({ title: "Erro ao carregar agenda", description: "Não foi possível buscar os horários. Tente novamente.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const daySchedule = nutriSchedule[dateStr] || [];
      const today = new Date();
      
      const slots = daySchedule.map(timeStr => {
        const [hour, minute] = timeStr.split(':').map(Number);
        return setMilliseconds(setSeconds(setMinutes(setHours(selectedDate, hour), minute), 0), 0);
      }).filter(slotTime => {
        const isBooked = bookedSlots.some(bookedSlot => isSameDay(bookedSlot, slotTime) && bookedSlot.getHours() === slotTime.getHours() && bookedSlot.getMinutes() === slotTime.getMinutes());
        return !isBooked && isAfter(slotTime, today);
      });
      setAvailableSlots(slots);
      setSelectedTimeSlot(null);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, bookedSlots, nutriSchedule]);

  const handleDateClick = (day) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isBefore(day, today)) {
      toast({ title: "Data Inválida", description: "Não é possível agendar em datas passadas.", variant: "destructive" });
      return;
    }
    setSelectedDate(day);
  };

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTimeSlot || !user) return;
    setIsBooking(true);

    try {
      const { error } = await supabase.from('appointments').insert({
        user_id: user.id,
        patient_name: user.name,
        patient_email: user.email,
        appointment_datetime: selectedTimeSlot.toISOString(),
        duration_minutes: appointmentDuration,
        status: 'confirmed',
      });

      if (error) throw error;

      toast({ title: "Agendamento Confirmado!", description: "Seu bate-papo com a nutri foi agendado com sucesso.", className: "bg-primary text-primary-foreground" });
      onScheduled();
    } catch (error) {
      console.error("Error confirming booking:", error);
      toast({ title: "Erro no Agendamento", description: "Não foi possível confirmar seu horário. Tente novamente.", variant: "destructive" });
    } finally {
      setIsBooking(false);
    }
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => (
    <div className="flex justify-between items-center p-2 bg-muted rounded-t-lg">
      <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft /></Button>
      <span className="text-lg font-semibold text-primary capitalize">
        {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
      </span>
      <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight /></Button>
    </div>
  );

  const renderDays = () => {
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return (
      <div className="grid grid-cols-7 gap-1 text-center font-medium text-sm text-muted-foreground p-2">
        {daysOfWeek.map(day => <div key={day}>{day}</div>)}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { locale: ptBR });
    const endDate = endOfWeek(monthEnd, { locale: ptBR });
    const today = new Date(); today.setHours(0, 0, 0, 0);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = new Date(day);
        const dateStr = format(cloneDay, 'yyyy-MM-dd');
        const isDayInPast = isBefore(cloneDay, today);
        const hasAvailability = nutriSchedule[dateStr] && nutriSchedule[dateStr].length > 0;

        let cellClass = "p-2 h-12 w-full text-center border border-transparent rounded-lg cursor-pointer transition-all duration-200 ease-in-out ";
        if (!isSameMonth(day, monthStart) || isDayInPast || !hasAvailability) {
          cellClass += "text-muted-foreground/50 bg-muted/30 cursor-not-allowed";
        } else if (isSameDay(day, selectedDate)) {
          cellClass += "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2";
        } else {
          cellClass += "bg-green-200 text-green-800 hover:bg-green-300 hover:shadow-md";
        }
        
        days.push(
          <div key={day.toString()} className="flex items-center justify-center">
            <button
              onClick={() => handleDateClick(cloneDay)}
              disabled={!isSameMonth(day, monthStart) || isDayInPast || !hasAvailability}
              className={cellClass}
            >
              {format(day, 'd')}
            </button>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="grid grid-cols-7 gap-1" key={day.toString()}>{days}</div>);
      days = [];
    }
    return <div className="p-2 space-y-1">{rows}</div>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl" 
      >
        <Card className="shadow-2xl">
          <CardHeader className="text-center bg-gradient-to-r from-primary to-accent text-primary-foreground p-6">
            <CardTitle className="text-3xl font-bold flex items-center justify-center"><CalendarDays className="mr-3 w-8 h-8"/>Agende seu Bate-Papo Inicial</CardTitle>
            <CardDescription className="text-lg text-primary-foreground/90">Escolha o melhor dia e horário para conversarmos.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-1 flex justify-center items-center md:pr-6">
              <motion.img 
                src={schedulingImageUrl} 
                alt="Nutricionista com calendário" 
                className="max-w-xs w-full h-auto object-contain rounded-lg shadow-lg"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              />
            </div>
            <div className="md:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Card className="shadow-inner">
                  {renderHeader()}
                  {renderDays()}
                  {renderCells()}
                </Card>
              </div>
              <div className="space-y-4">
                <Card className="shadow-inner">
                  <CardHeader>
                    <CardTitle className="text-xl text-primary flex items-center"><Clock className="mr-2 w-5 h-5"/>Horários Disponíveis</CardTitle>
                    <CardDescription>
                      {selectedDate ? `Para ${format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}` : 'Selecione uma data no calendário.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="max-h-60 overflow-y-auto">
                    {selectedDate && availableSlots.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                        {availableSlots.map(slot => (
                          <Button
                            key={slot.toISOString()}
                            variant={selectedTimeSlot && selectedTimeSlot.getTime() === slot.getTime() ? 'default' : 'outline'}
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`w-full ${selectedTimeSlot && selectedTimeSlot.getTime() === slot.getTime() ? 'bg-primary text-primary-foreground' : 'border-primary text-primary hover:bg-primary/10'}`}
                          >
                            {format(slot, 'HH:mm')}
                          </Button>
                        ))}
                      </div>
                    ) : selectedDate ? (
                      <p className="text-muted-foreground text-center py-4">Nenhum horário disponível neste dia.</p>
                    ) : (
                       <p className="text-muted-foreground text-center py-4">Selecione uma data para ver os horários.</p>
                    )}
                  </CardContent>
                </Card>
                {selectedDate && selectedTimeSlot && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-3 pt-4 border-t">
                    <p className="text-lg font-semibold text-primary">
                      Confirmar agendamento: <br/>
                      <span className="text-accent font-bold">{format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })} às {format(selectedTimeSlot, 'HH:mm')}</span>
                    </p>
                    <Button onClick={handleConfirmBooking} size="lg" className="w-full bg-green-500 hover:bg-green-600 text-white" disabled={isBooking}>
                      {isBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2"/>}
                      {isBooking ? 'Agendando...' : 'Confirmar Agendamento'}
                    </Button>
                  </motion.div>
                )}
                 <Button onClick={onCancel} variant="link" className="w-full text-muted-foreground hover:text-primary mt-4">
                  <XCircle className="mr-2"/> Sair e voltar depois
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SchedulingScreen;
