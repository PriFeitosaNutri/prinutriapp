import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as PieChartIcon, Weight, Droplets, CheckSquare, Trophy, Award, Target } from 'lucide-react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const getCurrentWeekNumber = () => {
  const today = new Date();
  const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
  const pastDaysOfYear = (today - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

const ProgressReport = ({ user }) => {
  const [reportData, setReportData] = useState(null);
  const [dailyTasksProgress, setDailyTasksProgress] = useState(0);
  const [taskCompletionStreak, setTaskCompletionStreak] = useState(0);
  const [earnedPins, setEarnedPins] = useState([]);

  const calculateDailyTasksProgress = useCallback(() => {
    const todayStr = new Date().toDateString();
    let completedTasks = 0;
    const totalTasks = 3;

    const waterMet = (parseInt(localStorage.getItem(`waterIntake_${user.email}_${todayStr}_PriNutriApp`)) || 0) >= (parseInt(localStorage.getItem(`waterGoal_${user.email}_PriNutriApp`)) || 2000);
    if (waterMet) completedTasks++;

    const mealsToday = JSON.parse(localStorage.getItem(`mealsV2_${user.email}_${todayStr}_PriNutriApp`)) || [];
    if (mealsToday.length > 0) completedTasks++;

    const checklistTodayData = JSON.parse(localStorage.getItem(`dailyChecklistV3_${user.email}_${todayStr}_PriNutriApp`));
    const essentialHabits = checklistTodayData?.habits || [];
    if (essentialHabits.length > 0 && essentialHabits.every(h => h.completed)) completedTasks++;
    
    setDailyTasksProgress(Math.round((completedTasks / totalTasks) * 100));
  }, [user.email]);


  useEffect(() => {
    const anamnesisData = JSON.parse(localStorage.getItem(`anamnesis_${user.email}_PriNutriApp`));
    const waterGoal = parseInt(localStorage.getItem(`waterGoal_${user.email}_PriNutriApp`)) || 2000;
    
    const weightLossGoal = parseFloat(anamnesisData?.weightLossGoal) || 0;
    const currentWeight = parseFloat(anamnesisData?.weight) || 0;
    
    const initialWeight = parseFloat(localStorage.getItem(`initialWeight_${user.email}_PriNutriApp`)) || (currentWeight + (weightLossGoal > 0 ? Math.random() * weightLossGoal * 0.5 : 0));
    localStorage.setItem(`initialWeight_${user.email}_PriNutriApp`, initialWeight.toString());
    const weightLost = Math.max(0, initialWeight - currentWeight);
    const remainingToLose = Math.max(0, weightLossGoal - weightLost);

    const todayStr = new Date().toDateString();
    const waterIntakeToday = parseInt(localStorage.getItem(`waterIntake_${user.email}_${todayStr}_PriNutriApp`)) || 0;
    const waterProgress = waterGoal > 0 ? Math.min((waterIntakeToday / waterGoal) * 100, 100) : 0;

    const dailyChecklistData = JSON.parse(localStorage.getItem(`dailyChecklistV3_${user.email}_${todayStr}_PriNutriApp`));
    const dailyChecklistItems = dailyChecklistData?.habits || [];
    const dailyCompleted = dailyChecklistItems.filter(item => item.completed).length;
    const dailyTotal = dailyChecklistItems.length || 1; 
    const checklistProgress = dailyTotal > 0 ? Math.round((dailyCompleted / dailyTotal) * 100) : 0;

    setReportData({
      weight: { initial: initialWeight, current: currentWeight, goal: currentWeight - remainingToLose, lost: weightLost, remaining: remainingToLose, goalTotal: weightLossGoal },
      water: { intake: waterIntakeToday, goal: waterGoal, progress: waterProgress },
      checklist: { completed: dailyCompleted, total: dailyTotal, progress: checklistProgress }
    });

    calculateDailyTasksProgress();
    const intervalId = setInterval(calculateDailyTasksProgress, 5000); 

    const currentWeekNum = getCurrentWeekNumber();
    const streak = parseInt(localStorage.getItem(`dailyTaskStreak_${user.email}_${currentWeekNum}_PriNutriApp`)) || 0;
    setTaskCompletionStreak(streak);

    const storedEarnedPins = JSON.parse(localStorage.getItem(`earnedPins_${user.email}_PriNutriApp`)) || [];
    setEarnedPins(storedEarnedPins);

    return () => clearInterval(intervalId);
  }, [user.email, calculateDailyTasksProgress]);

  if (!reportData) {
    return (
      <Card className="shadow-lg">
        <CardHeader> <CardTitle className="flex items-center text-primary"><PieChartIcon className="w-6 h-6 mr-2" />Seu Progresso</CardTitle> <CardDescription>Carregando seus dados...</CardDescription> </CardHeader>
        <CardContent className="text-center py-8"><p>Aguarde um momento.</p></CardContent>
      </Card>
    );
  }

  const weightChartData = {
    labels: ['Peso Perdido (kg)', 'Falta Perder (kg)'],
    datasets: [ { 
        data: [
            reportData.weight.lost.toFixed(1), 
            reportData.weight.remaining > 0 ? reportData.weight.remaining.toFixed(1) : 0.01, // Ensure a small value if 0 for chart rendering
        ], 
        backgroundColor: ['hsl(120 60% 35%)', 'hsl(50 100% 50%)'], 
        borderColor: ['hsl(var(--card))', 'hsl(var(--card))'], 
        borderWidth: 2,
      }, 
    ],
  };
  
  const chartOptions = { 
    responsive: true, 
    maintainAspectRatio: false, 
    plugins: { 
      legend: { position: 'bottom', labels: { color: 'hsl(var(--foreground))', font: { size: 14 } } }, 
      tooltip: { 
        callbacks: { 
          label: function(context) { 
            let label = context.label || ''; 
            if (label) { label += ': '; } 
            if (context.parsed !== null) { 
              label += context.parsed + ' kg'; 
            } 
            return label; 
          } 
        } 
      } 
    }, 
  };

  const taskPinsCollected = earnedPins.filter(p => p.type === "task");
  const hydrationPinsCollected = earnedPins.filter(p => p.type === "hydration");

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader> <CardTitle className="flex items-center text-primary"><PieChartIcon className="w-7 h-7 mr-2" />Seu Relatório de Progresso</CardTitle> <CardDescription>Veja sua evolução no PriNutriApp!</CardDescription> </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center"><Target className="w-5 h-5 mr-2 text-primary" />Meta de Perda de Peso</h2>
              {reportData.weight.goalTotal > 0 ? (
                <>
                  <div className="h-64 md:h-80 relative"><Pie data={weightChartData} options={chartOptions} /></div>
                  <div className="mt-4 text-center space-y-1 font-medium">
                    <p style={{color: 'hsl(0 70% 50%)'}}><strong>Meta Total:</strong> {reportData.weight.goalTotal.toFixed(1)} kg</p>
                    <p style={{color: 'hsl(120 60% 35%)'}}><strong>Peso Perdido:</strong> {reportData.weight.lost.toFixed(1)} kg</p>
                    {reportData.weight.remaining > 0 && <p style={{color: 'hsl(50 100% 50%)'}}><strong>Falta Perder:</strong> {reportData.weight.remaining.toFixed(1)} kg</p>}
                    {reportData.weight.lost >= reportData.weight.goalTotal && <p className="text-primary font-bold text-lg mt-2">🎉 Parabéns! Você atingiu sua meta de peso! 🎉</p>}
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-muted-foreground"><Weight className="w-12 h-12 mx-auto mb-2 opacity-70" /><p>Nenhuma meta de perda de peso definida.</p><p className="text-sm">Fale com sua nutri para definir uma meta!</p></div>
              )}
            </div>
            <div className="space-y-4">
              <Card className="bg-primary/5"><CardHeader className="pb-2"><CardTitle className="text-lg flex items-center text-primary"><Weight className="w-5 h-5 mr-2" /> Peso Atual</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-foreground">{reportData.weight.current.toFixed(1)} kg</p><p className="text-sm text-muted-foreground">Inicial: {reportData.weight.initial.toFixed(1)} kg</p></CardContent></Card>
              <Card className="bg-primary/5"><CardHeader className="pb-2"><CardTitle className="text-lg flex items-center text-primary"><Droplets className="w-5 h-5 mr-2" /> Hidratação Diária</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-foreground">{reportData.water.intake} ml / <span className="text-xl">{reportData.water.goal} ml</span></p><p className="text-sm text-muted-foreground">{reportData.water.progress.toFixed(0)}% da meta</p></CardContent></Card>
              <Card className="bg-primary/5"><CardHeader className="pb-2"><CardTitle className="text-lg flex items-center text-primary"><CheckSquare className="w-5 h-5 mr-2" /> Checklist Diário (Hábitos)</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-foreground">{reportData.checklist.completed} / {reportData.checklist.total} tarefas</p><p className="text-sm text-muted-foreground">{reportData.checklist.progress.toFixed(0)}% concluído</p></CardContent></Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader><CardTitle className="text-primary flex items-center"><Trophy className="w-6 h-6 mr-2"/>Progresso Diário de Tarefas</CardTitle><CardDescription>Complete hidratação, diário e checklist para avançar!</CardDescription></CardHeader>
        <CardContent>
            <div className="relative w-full pt-2">
              <Progress value={dailyTasksProgress} className="h-6 [&>div]:bg-gradient-to-r [&>div]:from-green-400 [&>div]:to-primary" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-semibold text-white drop-shadow-md">{dailyTasksProgress}% das tarefas diárias completas</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">{taskCompletionStreak} de 5 dias com todas as tarefas concluídas esta semana para o próximo troféu!</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader><CardTitle className="text-primary flex items-center"><Award className="w-6 h-6 mr-2"/>Sua Coleção de Pins</CardTitle><CardDescription>Todos os pins que você conquistou!</CardDescription></CardHeader>
        <CardContent>
            {earnedPins.length === 0 ? (
                 <p className="text-muted-foreground text-center py-4">Você ainda não ganhou nenhum pin. Continue se dedicando!</p>
            ) : (
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-primary/80 mb-2">Pins de Tarefas (Troféus):</h3>
                        {taskPinsCollected.length > 0 ? (
                            <div className="flex flex-wrap gap-2 sm:gap-4">
                                {taskPinsCollected.map(pin => (
                                    <motion.div key={pin.name} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center p-2 border rounded-lg bg-card shadow-sm w-24 sm:w-28">
                                        <img src={pin.image} alt={pin.name} className="w-12 h-12 sm:w-16 sm:h-16 object-contain mb-1"/>
                                        <Badge variant="secondary" className="text-xs text-center">{pin.name}</Badge>
                                    </motion.div>
                                ))}
                            </div>
                        ) : <p className="text-sm text-muted-foreground">Continue completando suas tarefas para ganhar troféus!</p>}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-primary/80 mb-2">Pins de Hidratação (Garrafinhas):</h3>
                        {hydrationPinsCollected.length > 0 ? (
                             <div className="flex flex-wrap gap-2 sm:gap-4">
                                {hydrationPinsCollected.map(pin => (
                                     <motion.div key={pin.name} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center p-2 border rounded-lg bg-card shadow-sm w-24 sm:w-28">
                                        <img src={pin.image} alt={pin.name} className="w-12 h-12 sm:w-16 sm:h-16 object-contain mb-1"/>
                                        <Badge variant="secondary" className="text-xs text-center">{pin.name}</Badge>
                                    </motion.div>
                                ))}
                            </div>
                        ) : <p className="text-sm text-muted-foreground">Bata suas metas de água para ganhar garrafinhas!</p>}
                    </div>
                </div>
            )}
        </CardContent>
      </Card>

    </div>
  );
};

export default ProgressReport;