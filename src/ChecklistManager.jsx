import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Calendar, Smile, Brain, Utensils, Zap, Salad, TrendingUp, Award, ThumbsUp, PenSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { getDailyChecklist, saveDailyChecklist, getWeeklyChecklist, saveWeeklyChecklist } from '@/lib/database';
import { format, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ChecklistManager = ({ user, onChecklistCompleted }) => {
  const [dailyChecklist, setDailyChecklist] = useState(null);
  const [weeklyChecklist, setWeeklyChecklist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const weekStartStr = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  const initialDailyState = {
    habits: [
      { id: 1, text: "Bater sua meta de água", icon: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/dc5f15f90afb63a2fc3614f0c3c01a56.png", completed: false },
      { id: 2, text: "Comer 3 porções de frutas", icon: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/2404f797e1d076ccb95b1c17ffbe7178.png", completed: false },
      { id: 3, text: "Fazer alguma atividade física", icon: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/362968a971f0560dcda341df38e076ca.png", completed: false },
      { id: 4, text: "Dormir pelo menos 7 horas", icon: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/9d2485435c1f8f0e228335bf227b9be6.png", completed: false },
      { id: 6, text: "Praticar um momento de autocuidado", icon: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/3c74811f80067e2352b8e5301822c7e4.png", completed: false },
    ],
    feelings: null,
    consciousEating: { distractions: null, chewing: null, seatedAtTable: null },
    hungerSatiety: { hungerCues: null, satietyCues: null },
    foodQuality: { fiberSources: null, varietyInPlan: null },
    planning: { followedPlan: null, plannedTomorrow: null }
  };
  
  const initialWeeklyState = {
      items: [
        { id: 1, text: "Planejar refeições da semana", icon: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/1e0308ccd14aa2696bdb79c625fc32e3.png", completed: false },
        { id: 2, text: "Fazer compras saudáveis", icon: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/d1234b79f0eeaa4720caa0ccb90c77d7.png", completed: false },
        { id: 3, text: "Praticar exercícios físicos", icon: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/da0f9ca0343882df8a08c34dd084ae52.png", completed: false },
        { id: 4, text: "Reservar um tempo para relaxar", icon: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/3c74811f80067e2352b8e5301822c7e4.png", completed: false },
        { id: 5, text: "Revisar seu progresso e metas", icon: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/9e0b22040300f5996924b7efd20defff.png", completed: false },
        { id: 6, text: "O planejamento e lista de compras ajudaram?", isQuestion: true, answer: null, completed: false },
      ],
      nextWeekGoal: ''
  };

  const loadChecklists = useCallback(async () => {
    setIsLoading(true);
    try {
      const [dailyData, weeklyData] = await Promise.all([
        getDailyChecklist(user.id, todayStr),
        getWeeklyChecklist(user.id, weekStartStr)
      ]);
      setDailyChecklist(dailyData || initialDailyState);
      setWeeklyChecklist(weeklyData || initialWeeklyState);
    } catch (error) {
      toast({ title: "Erro ao carregar checklists", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user.id, todayStr, weekStartStr, toast]);

  useEffect(() => {
    loadChecklists();
  }, [loadChecklists]);

  const handleUpdate = async (type, updatedData) => {
    try {
      if (type === 'daily') {
        setDailyChecklist(updatedData);
        await saveDailyChecklist(user.id, todayStr, updatedData);
        if (onChecklistCompleted && updatedData.habits?.every(h => h.completed)) {
          onChecklistCompleted();
        }
      } else if (type === 'weekly') {
        setWeeklyChecklist(updatedData);
        await saveWeeklyChecklist(user.id, weekStartStr, updatedData);
      }
    } catch (error) {
      toast({ title: "Erro ao salvar", description: "Não foi possível salvar seu progresso.", variant: "destructive" });
      loadChecklists(); // Revert to saved state on error
    }
  };
  
  const handleHabitToggle = (id) => {
    if (!dailyChecklist) return;
    const updatedHabits = dailyChecklist.habits.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    const updated = { ...dailyChecklist, habits: updatedHabits };
    handleUpdate('daily', updated);

    if (updatedHabits.every(item => item.completed)) {
        toast({ title: "🎉 Parabéns!", description: "Você completou todos os hábitos diários!", className: "bg-primary text-primary-foreground" });
    }
  };
  
  const handleRadioChange = (category, subCategory, value) => {
    if (!dailyChecklist) return;
    const updated = { ...dailyChecklist, [category]: { ...dailyChecklist[category], [subCategory]: value } };
    handleUpdate('daily', updated);
  };
  
  const handleFeelingChange = (value) => {
    if (!dailyChecklist) return;
    const updated = { ...dailyChecklist, feelings: value };
    handleUpdate('daily', updated);
    toast({ title: `Sentimento registrado!`, className: "bg-primary text-primary-foreground" });
  };
  
  const toggleWeeklyItem = (id) => {
    if (!weeklyChecklist) return;
    const updatedItems = weeklyChecklist.items.map(item =>
      item.id === id && !item.isQuestion ? { ...item, completed: !item.completed } : item
    );
    const updated = { ...weeklyChecklist, items: updatedItems };
    handleUpdate('weekly', updated);

    if (updatedItems.filter(item => !item.isQuestion).every(item => item.completed)) {
      toast({ title: "🎉 Parabéns!", description: "Você completou todas as metas semanais!", className: "bg-primary text-primary-foreground" });
    }
  };

  const handleWeeklyQuestionChange = (id, value) => {
    if (!weeklyChecklist) return;
    const updatedItems = weeklyChecklist.items.map(item =>
        item.id === id && item.isQuestion ? { ...item, answer: value, completed: true } : item
    );
    const updated = { ...weeklyChecklist, items: updatedItems };
    handleUpdate('weekly', updated);
  };
  
  const handleNextWeekGoalChange = (e) => {
    if (!weeklyChecklist) return;
    const updated = { ...weeklyChecklist, nextWeekGoal: e.target.value };
    setWeeklyChecklist(updated);
  };

  const handleSaveWeeklyGoal = () => {
     handleUpdate('weekly', weeklyChecklist);
     toast({ title: "Meta salva!", description: "Sua meta para a próxima semana foi registrada." });
  };

  const feelingOptions = [
    { id: 'tranquilo', text: 'Tranquilo(a)', icon: '😌' },
    { id: 'ansioso', text: 'Ansioso(a)', icon: '😟' },
    { id: 'culpado', text: 'Culpado(a)', icon: '😔' },
    { id: 'satisfeito', text: 'Satisfeito(a)', icon: '😊' },
  ];

  if (isLoading || !dailyChecklist || !weeklyChecklist) {
    return <Card className="p-4 text-center">Carregando checklists...</Card>;
  }
  
  const weeklyProgress = () => {
    const nonQuestionItems = weeklyChecklist.items.filter(item => !item.isQuestion);
    if (nonQuestionItems.length === 0) return 0;
    const completed = nonQuestionItems.filter(item => item.completed).length;
    return Math.round((completed / nonQuestionItems.length) * 100);
  };
  
  const renderYesNoQuestion = (question, category, subCategory, value) => (
    <div className="py-3 px-2">
      <p className="font-medium mb-3 text-sm">{question}</p>
      <RadioGroup value={value || ''} onValueChange={(val) => handleRadioChange(category, subCategory, val)} className="flex gap-4">
        <div className="flex items-center space-x-2"><RadioGroupItem value="sim" id={`${category}-${subCategory}-sim`} /><Label htmlFor={`${category}-${subCategory}-sim`}>Sim</Label></div>
        <div className="flex items-center space-x-2"><RadioGroupItem value="nao" id={`${category}-${subCategory}-nao`} /><Label htmlFor={`${category}-${subCategory}-nao`}>Não</Label></div>
      </RadioGroup>
    </div>
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-primary/10">
          <TabsTrigger value="daily" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">📅 Checklist Diário</TabsTrigger>
          <TabsTrigger value="weekly" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">📊 Checklist Semanal</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">
          <Card className="shadow-lg">
            <CardHeader><CardTitle className="text-primary">Atividades de Hoje</CardTitle><CardDescription>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</CardDescription></CardHeader>
            <CardContent>
              <Accordion type="multiple" defaultValue={['habitos']} className="w-full">
                 <AccordionItem value="habitos">
                  <AccordionTrigger className="text-lg font-semibold text-primary/90"><Award className="w-5 h-5 mr-2"/> Hábitos Essenciais</AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-4">
                    {dailyChecklist.habits?.map((item, index) => (
                      <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${item.completed ? 'bg-primary/10 border-primary/30' : 'bg-card hover:bg-muted/50'}`}>
                        <Checkbox id={`habit-${item.id}`} checked={item.completed} onCheckedChange={() => handleHabitToggle(item.id)} />
                        <img src={item.icon} alt={item.text} className="w-8 h-8 object-contain" />
                        <label htmlFor={`habit-${item.id}`} className={`flex-1 cursor-pointer ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{item.text}</label>
                      </motion.div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="bem-estar">
                    <AccordionTrigger className="text-lg font-semibold text-primary/90"><Smile className="w-5 h-5 mr-2"/> Bem-estar Geral</AccordionTrigger>
                    <AccordionContent className="pt-4">
                        <p className="font-medium mb-3 text-sm">Como me senti em relação à minha alimentação hoje?</p>
                        <RadioGroup value={dailyChecklist.feelings || ''} onValueChange={handleFeelingChange} className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                           {feelingOptions.map(option => ( <div key={option.id}><RadioGroupItem value={option.id} id={option.id} className="sr-only"/><Label htmlFor={option.id} className={`flex flex-col items-center justify-center p-2 border-2 rounded-lg cursor-pointer transition-all text-center ${dailyChecklist.feelings === option.id ? 'border-primary bg-primary/10' : 'border-muted hover:border-primary/50'}`}><span className="text-2xl mb-1">{option.icon}</span><span className="text-xs font-medium">{option.text}</span></Label></div>))}
                        </RadioGroup>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="alimentacao-consciente"><AccordionTrigger className="text-lg font-semibold text-primary/90"><Brain className="w-5 h-5 mr-2"/> Alimentação Consciente</AccordionTrigger><AccordionContent className="divide-y">{renderYesNoQuestion("Evitei distrações (TV, celular)?", "consciousEating", "distractions", dailyChecklist.consciousEating?.distractions)}{renderYesNoQuestion("Mastiguei devagar?", "consciousEating", "chewing", dailyChecklist.consciousEating?.chewing)}{renderYesNoQuestion("Comi sentado(a) à mesa?", "consciousEating", "seatedAtTable", dailyChecklist.consciousEating?.seatedAtTable)}</AccordionContent></AccordionItem>
                <AccordionItem value="fome-saciedade"><AccordionTrigger className="text-lg font-semibold text-primary/90"><Utensils className="w-5 h-5 mr-2"/> Fome e Saciedade</AccordionTrigger><AccordionContent className="divide-y">{renderYesNoQuestion("Prestei atenção à fome?", "hungerSatiety", "hungerCues", dailyChecklist.hungerSatiety?.hungerCues)}{renderYesNoQuestion("Parei ao me sentir satisfeito(a)?", "hungerSatiety", "satietyCues", dailyChecklist.hungerSatiety?.satietyCues)}</AccordionContent></AccordionItem>
                 <AccordionItem value="qualidade-alimentar"><AccordionTrigger className="text-lg font-semibold text-primary/90"><Salad className="w-5 h-5 mr-2"/> Qualidade Alimentar</AccordionTrigger><AccordionContent className="divide-y">{renderYesNoQuestion("Incluí fontes de fibras?", "foodQuality", "fiberSources", dailyChecklist.foodQuality?.fiberSources)}{renderYesNoQuestion("Variei dentro do plano?", "foodQuality", "varietyInPlan", dailyChecklist.foodQuality?.varietyInPlan)}</AccordionContent></AccordionItem>
                <AccordionItem value="planejamento"><AccordionTrigger className="text-lg font-semibold text-primary/90"><PenSquare className="w-5 h-5 mr-2"/> Planejamento</AccordionTrigger><AccordionContent className="divide-y">{renderYesNoQuestion("Segui o plano do dia?", "planning", "followedPlan", dailyChecklist.planning?.followedPlan)}{renderYesNoQuestion("Planejei o dia de amanhã?", "planning", "plannedTomorrow", dailyChecklist.planning?.plannedTomorrow)}</AccordionContent></AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="weekly">
           <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between text-primary"><div className="flex items-center"><Calendar className="w-6 h-6 mr-2" />Checklist Semanal</div><div className="text-sm bg-primary/20 text-primary px-3 py-1 rounded-full font-semibold">{weeklyProgress()}%</div></CardTitle>
                    <CardDescription>Semana de {format(startOfWeek(new Date(), { weekStartsOn: 1 }), "dd 'de' MMMM", { locale: ptBR })}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {weeklyChecklist.items.map((item, index) => (
                        <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className={`p-3 rounded-lg border transition-all ${item.completed ? 'bg-primary/10 border-primary/30' : 'bg-card hover:bg-muted/50'}`}>
                            {item.isQuestion ? (<div className="py-1"><p className="font-medium mb-2 text-sm">{item.text}</p><RadioGroup value={item.answer || ''} onValueChange={(val) => handleWeeklyQuestionChange(item.id, val)} className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="sim" id={`weekly-q-${item.id}-sim`} /><Label htmlFor={`weekly-q-${item.id}-sim`}>Sim</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="nao" id={`weekly-q-${item.id}-nao`} /><Label htmlFor={`weekly-q-${item.id}-nao`}>Não</Label></div></RadioGroup></div>
                            ) : (<div className="flex items-center space-x-3"><Checkbox id={`weekly-${item.id}`} checked={item.completed} onCheckedChange={() => toggleWeeklyItem(item.id)} /><img src={item.icon} alt={item.text} className="w-8 h-8 object-contain" /><label htmlFor={`weekly-${item.id}`} className={`flex-1 cursor-pointer ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{item.text}</label></div>
                            )}
                        </motion.div>
                        ))}
                    </div>
                    <div className="mt-6 space-y-2">
                        <Label htmlFor="nextWeekGoal" className="text-md font-semibold text-primary/90">Minha meta principal para a próxima semana é:</Label>
                        <Textarea id="nextWeekGoal" value={weeklyChecklist.nextWeekGoal} onChange={handleNextWeekGoalChange} onBlur={handleSaveWeeklyGoal} placeholder="Ex: Beber mais água, fazer exercícios 3x..." rows={3} className="focus:ring-primary" />
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChecklistManager;