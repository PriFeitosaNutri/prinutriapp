import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, getDay, parseISO, addMinutes, setHours, setMinutes, setSeconds, setMilliseconds, isBefore, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';

const SchedulingScreen = ({ user, onScheduled, onCancel }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 6, 1)); // July 2025
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [nutriSchedule, setNutriSchedule] = useState({});
  const { toast } = useToast();

  const appointmentDuration = 50;
  const schedulingImageUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/60bcbd3eeb5dd417461a84863c1313b6.png";

  const normalizeEmail = (emailStr) => emailStr.toLowerCase().trim();

  const loadBookedSlots = useCallback(() => {
    const allAppointments = JSON.parse(localStorage.getItem('globalAppointments_PriNutriApp')) || [];
    setBookedSlots(allAppointments.map(app => parseISO(app.dateTime)));
  }, []);

  const loadNutriSchedule = useCallback(() => {
    const schedule = JSON.parse(localStorage.getItem('nutriAvailability_PriNutriApp')) || {};
    if (Object.keys(schedule).length === 0) {
      const july2025Schedule = {};
      const july = new Date(2025, 6, 1);
      const daysInJuly = eachDayOfInterval({ start: startOfMonth(july), end: endOfMonth(july) });
      
      daysInJuly.forEach(day => {
        const dayOfWeek = getDay(day);
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          const dateStr = format(day, 'yyyy-MM-dd');
          july2025Schedule[dateStr] = [];
          for (let hour = 8; hour < 11; hour++) {
            july2025Schedule[dateStr].push(format(setMinutes(setHours(day, hour), 0), 'HH:mm'));
          }
          for (let hour = 13; hour < 17; hour++) {
            july2025Schedule[dateStr].push(format(setMinutes(setHours(day, hour), 0), 'HH:mm'));
          }
        }
      });
      localStorage.setItem('nutriAvailability_PriNutriApp', JSON.stringify(july2025Schedule));
      setNutriSchedule(july2025Schedule);
    } else {
      setNutriSchedule(schedule);
    }
  }, []);

  useEffect(() => {
    loadBookedSlots();
    loadNutriSchedule();
  }, [loadBookedSlots, loadNutriSchedule]);

  useEffect(() => {
    if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const daySchedule = nutriSchedule[dateStr] || [];
      const today = new Date();
      
      const slots = daySchedule.map(timeStr => {
        const [hour, minute] = timeStr.split(':').map(Number);
        return setMilliseconds(setSeconds(setMinutes(setHours(selectedDate, hour), minute), 0), 0);
      }).filter(slotTime => {
        const isBooked = bookedSlots.some(bookedSlot => 
          isSameDay(bookedSlot, slotTime) && 
          bookedSlot.getHours() === slotTime.getHours() && 
          bookedSlot.getMinutes() === slotTime.getMinutes()
        );
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
    today.setHours(0,0,0,0);
    if (isBefore(day, today)) {
        toast({ title: "Data Inválida", description: "Não é possível agendar em datas passadas.", variant: "destructive" });
        return;
    }
    const dateStr = format(day, 'yyyy-MM-dd');
    if (!nutriSchedule[dateStr] || nutriSchedule[dateStr].length === 0) {
        toast({ title: "Dia Indisponível", description: "A nutri não tem horários disponíveis neste dia.", variant: "destructive" });
        return;
    }
    const daySlots = nutriSchedule[dateStr].map(timeStr => {
        const [hour, minute] = timeStr.split(':').map(Number);
        return setMilliseconds(setSeconds(setMinutes(setHours(day, hour), minute), 0), 0);
    }).filter(slotTime => isAfter(slotTime, new Date()));

    const allSlotsBooked = daySlots.every(slotTime => 
        bookedSlots.some(bookedSlot => 
            isSameDay(bookedSlot, slotTime) && 
            bookedSlot.getHours() === slotTime.getHours() && 
            bookedSlot.getMinutes() === slotTime.getMinutes()
        )
    );

    if (allSlotsBooked && daySlots.length > 0) {
        toast({ title: "Dia Lotado", description: "Todos os horários para este dia já foram agendados.", variant: "destructive" });
        return;
    }

    setSelectedDate(day);
  };

  const handleTimeSlotClick = (slot) => {
    setSelectedTimeSlot(slot);
  };

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedTimeSlot || !user) return;
    const normalizedUserEmail = normalizeEmail(user.email);

    const appointmentDateTime = selectedTimeSlot;
    const newAppointment = {
      id: `${normalizedUserEmail}_${appointmentDateTime.toISOString()}`,
      patientName: user.name,
      patientEmail: normalizedUserEmail,
      dateTime: appointmentDateTime.toISOString(),
      duration: appointmentDuration,
      status: 'confirmed',
      viewedByNutri: false,
    };

    const allAppointments = JSON.parse(localStorage.getItem('globalAppointments_PriNutriApp')) || [];
    allAppointments.push(newAppointment);
    localStorage.setItem('globalAppointments_PriNutriApp', JSON.stringify(allAppointments));
    
    loadBookedSlots(); 
    onScheduled(); 
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => (
    <div className="flex justify-between items-center p-2 bg-muted rounded-t-lg">
      <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft /></Button>
      <span className="text-lg font-semibold text-primary">
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
    const today = new Date(); today.setHours(0,0,0,0);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = new Date(day);
        const dateStr = format(cloneDay, 'yyyy-MM-dd');
        const isDayInPast = isBefore(cloneDay, today);
        const hasAvailabilityInNutriSchedule = nutriSchedule[dateStr] && nutriSchedule[dateStr].length > 0;
        
        let daySlotsFromNutri = [];
        if (hasAvailabilityInNutriSchedule) {
            daySlotsFromNutri = nutriSchedule[dateStr].map(timeStr => {
                const [hour, minute] = timeStr.split(':').map(Number);
                return setMilliseconds(setSeconds(setMinutes(setHours(cloneDay, hour), minute), 0), 0);
            }).filter(slotTime => isAfter(slotTime, new Date()));
        }

        const isFullyBooked = hasAvailabilityInNutriSchedule && daySlotsFromNutri.length > 0 && daySlotsFromNutri.every(slotTime => 
            bookedSlots.some(bookedSlot => 
                isSameDay(bookedSlot, slotTime) && 
                bookedSlot.getHours() === slotTime.getHours() && 
                bookedSlot.getMinutes() === slotTime.getMinutes()
            )
        );
        
        const hasAnyFutureSlots = daySlotsFromNutri.length > 0;

        let cellClass = "p-2 h-12 w-full text-center border border-transparent rounded-lg cursor-pointer transition-all duration-200 ease-in-out ";
        if (!isSameMonth(day, monthStart) || isDayInPast) {
          cellClass += "text-muted-foreground/50 bg-muted/30 cursor-not-allowed";
        } else if (!hasAvailabilityInNutriSchedule || !hasAnyFutureSlots || isFullyBooked) {
          cellClass += "bg-red-200 text-red-700 cursor-not-allowed line-through";
        } else if (isSameDay(day, selectedDate)) {
          cellClass += "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2";
        } else {
          cellClass += "bg-green-200 text-green-800 hover:bg-green-300 hover:shadow-md";
        }
        
        days.push(
          <div key={day.toString()} className="flex items-center justify-center">
            <button
              onClick={() => handleDateClick(cloneDay)}
              disabled={!isSameMonth(day, monthStart) || isDayInPast || !hasAvailabilityInNutriSchedule || !hasAnyFutureSlots || isFullyBooked}
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
  
  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

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
                            onClick={() => handleTimeSlotClick(slot)}
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
                    <Button onClick={handleConfirmBooking} size="lg" className="w-full bg-green-500 hover:bg-green-600 text-white">
                      <CheckCircle className="mr-2"/> Confirmar Agendamento
                    </Button>
                  </motion.div>
                )}
                 <Button onClick={onCancel} variant="link" className="w-full text-muted-foreground hover:text-primary mt-4">
                  <XCircle className="mr-2"/> Cancelar e voltar
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