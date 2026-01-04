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


const ChecklistManager = ({ user, onChecklistCompleted }) => {
  const [dailyChecklist, setDailyChecklist] = useState({});
  const [weeklyChecklist, setWeeklyChecklist] = useState([]);
  const [nextWeekGoal, setNextWeekGoal] = useState('');
  
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [showWeeklyReward, setShowWeeklyReward] = useState(false);
  const { toast } = useToast();

  const getWeekStart = () => {
    const today = new Date();
    const day = today.getDay() || 7; 
    const diff = today.getDate() - day + 1; 
    return new Date(today.setDate(diff));
  };
  
  const dailyKey = `dailyChecklistV3_${user.email}_${new Date().toDateString()}_PriNutriApp`;
  const weeklyKey = `weeklyChecklistV2_${user.email}_${getWeekStart().toDateString()}_PriNutriApp`;
  const nextWeekGoalKey = `nextWeekGoal_${user.email}_${getWeekStart().toDateString()}_PriNutriApp`;
  
  const initialDailyState = {
    habits: [
      { id: 1, text: "Bater sua meta de água", icon: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/dc5f15f90afb63a2fc3614f0c3c01a56.png", completed: false },
      { id: 2, text: "Comer 3 porções de frutas", icon: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/2404f797e1d076ccb95b1c17ffbe7178.png", completed: false },
      { id: 3, text: "Fazer alguma atividade física", icon: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/362968a971f0560dcda341df38e076ca.png", completed: false },
      { id: 4, text: "Dormir pelo menos 7 horas", icon: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/9d2485435c1f8f0e228335bf227b9be6.png", completed: false },
      { id: 6, text: "Praticar um momento de autocuidado", icon: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/3c74811f80067e2352b8e5301822c7e4.png", completed: false },
    ],
    feelings: null,
    consciousEating: {
      distractions: null,
      chewing: null,
      seatedAtTable: null,
    },
    hungerSatiety: {
      hungerCues: null,
      satietyCues: null
    },
    foodQuality: {
      fiberSources: null,
      varietyInPlan: null,
    },
    planning: {
      followedPlan: null,
      plannedTomorrow: null,
    }
  };
  
  const feelingOptions = [
      { id: 'tranquilo', text: 'Tranquilo(a)', icon: '😌' },
      { id: 'ansioso', text: 'Ansioso(a)', icon: '😟' },
      { id: 'culpado', text: 'Culpado(a)', icon: '😔' },
      { id: 'satisfeito', text: 'Satisfeito(a)', icon: '😊' },
  ];

  const defaultWeeklyItems = [
    { id: 1, text: "Planejar refeições da semana", icon: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/1e0308ccd14aa2696bdb79c625fc32e3.png" },
    { id: 2, text: "Fazer compras saudáveis", icon: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/d1234b79f0eeaa4720caa0ccb90c77d7.png" },
    { id: 3, text: "Praticar exercícios físicos", icon: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/da0f9ca0343882df8a08c34dd084ae52.png" },
    { id: 4, text: "Reservar um tempo para relaxar", icon: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/3c74811f80067e2352b8e5301822c7e4.png" },
    { id: 5, text: "Revisar seu progresso e metas", icon: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/9e0b22040300f5996924b7efd20defff.png" },
    { id: 6, text: "O planejamento e lista de compras ajudaram?", isQuestion: true, answer: null },
  ];

  const realChecklist = [
    { id: 'R', text: 'Respeitei minha fome e saciedade?', icon: '🍽️' },
    { id: 'E', text: 'Estive presente e consciente ao comer?', icon: '🧘' },
    { id: 'A', text: 'Apreciei os alimentos sem culpa?', icon: '✨' },
    { id: 'L', text: 'Liderei minhas escolhas com equilíbrio?', icon: '⚖️' },
  ];

  const [realAnswers, setRealAnswers] = useState({});

  useEffect(() => {
    const savedReal = localStorage.getItem(`realChecklist_${user.email}_${getWeekStart().toDateString()}_PriNutriApp`);
    if (savedReal) setRealAnswers(JSON.parse(savedReal));
  }, [user.email]);

  const handleRealToggle = (id, value) => {
    const updated = { ...realAnswers, [id]: value };
    setRealAnswers(updated);
    localStorage.setItem(`realChecklist_${user.email}_${getWeekStart().toDateString()}_PriNutriApp`, JSON.stringify(updated));
  };

  const getPredominantLetter = () => {
    const counts = { R: 0, E: 0, A: 0, L: 0 };
    Object.entries(realAnswers).forEach(([id, val]) => {
      if (val === 'sim') counts[id]++;
    });
    const max = Math.max(...Object.values(counts));
    if (max === 0) return null;
    return Object.keys(counts).find(key => counts[key] === max);
  };

  const getLetterFeedback = (letter) => {
    const feedbacks = {
      R: "Você está em sintonia com os sinais do seu corpo! Continuar respeitando a fome e saciedade é a base para uma relação saudável com a comida.",
      E: "Sua atenção plena ao comer está incrível! Estar presente transforma o ato de se alimentar em uma experiência muito mais rica.",
      A: "Comer sem culpa é libertador! Você está aprendendo a apreciar os alimentos pelo que eles são, nutrindo corpo e alma.",
      L: "O equilíbrio é a chave, e você está no comando! Suas escolhas conscientes mostram maturidade e autocuidado."
    };
    return feedbacks[letter] || "";
  };
  
  useEffect(() => {
    const savedDaily = localStorage.getItem(dailyKey);
    setDailyChecklist(savedDaily ? JSON.parse(savedDaily) : initialDailyState);

    const savedWeekly = localStorage.getItem(weeklyKey);
    setWeeklyChecklist(savedWeekly ? JSON.parse(savedWeekly) : defaultWeeklyItems.map(item => ({ ...item, completed: item.isQuestion ? item.answer !== null : false })));
  
    const savedNextWeekGoal = localStorage.getItem(nextWeekGoalKey);
    if (savedNextWeekGoal) setNextWeekGoal(savedNextWeekGoal);

  }, [user.email, dailyKey, weeklyKey, nextWeekGoalKey]);

  const saveDailyChecklist = useCallback((updatedChecklist) => {
    setDailyChecklist(updatedChecklist);
    localStorage.setItem(dailyKey, JSON.stringify(updatedChecklist));
    if (onChecklistCompleted && updatedChecklist.habits?.every(h => h.completed)) {
      onChecklistCompleted();
    }
  }, [dailyKey, onChecklistCompleted]);


  const handleHabitToggle = (id) => {
    const updatedHabits = dailyChecklist.habits.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    const updatedChecklist = { ...dailyChecklist, habits: updatedHabits };
    saveDailyChecklist(updatedChecklist);

    if (updatedHabits.every(item => item.completed)) {
        setShowDailyReward(true);
        toast({
          title: "🎉 Parabéns!",
          description: "Você completou todos os hábitos diários!",
          className: "bg-primary text-primary-foreground"
        });
        setTimeout(() => setShowDailyReward(false), 4000);
      }
  };

  const handleRadioChange = (category, subCategory, value) => {
    const updatedChecklist = {
      ...dailyChecklist,
      [category]: {
        ...dailyChecklist[category],
        [subCategory]: value
      }
    };
    saveDailyChecklist(updatedChecklist);
  };
  
  const handleFeelingChange = (value) => {
    const updatedChecklist = { ...dailyChecklist, feelings: value };
    saveDailyChecklist(updatedChecklist);
    toast({ title: `Sentimento registrado!`, className: "bg-primary text-primary-foreground" });
  };


  const toggleWeeklyItem = (id) => {
    const updated = weeklyChecklist.map(item =>
      item.id === id && !item.isQuestion ? { ...item, completed: !item.completed } : item
    );
    setWeeklyChecklist(updated);
    localStorage.setItem(weeklyKey, JSON.stringify(updated));

    if (updated.filter(item => !item.isQuestion).every(item => item.completed)) {
      setShowWeeklyReward(true);
      toast({ title: "🎉 Parabéns!", description: "Você completou todas as metas semanais!", className: "bg-primary text-primary-foreground" });
      setTimeout(() => setShowWeeklyReward(false), 4000);
    }
  };

  const handleWeeklyQuestionChange = (id, value) => {
    const updated = weeklyChecklist.map(item =>
        item.id === id && item.isQuestion ? { ...item, answer: value, completed: true } : item
    );
    setWeeklyChecklist(updated);
    localStorage.setItem(weeklyKey, JSON.stringify(updated));
  };
  
  const handleNextWeekGoalChange = (e) => {
    setNextWeekGoal(e.target.value);
    localStorage.setItem(nextWeekGoalKey, e.target.value);
  }
  
  const getProgress = (list) => {
    const nonQuestionItems = list.filter(item => !item.isQuestion);
    if (!nonQuestionItems || nonQuestionItems.length === 0) return 0;
    const completed = nonQuestionItems.filter(item => item.completed).length;
    return Math.round((completed / nonQuestionItems.length) * 100);
  };

  const renderReward = (showRewardState) => (
    <AnimatePresence>
      {showRewardState && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="text-center mb-6 p-4 bg-accent/10 rounded-lg border border-accent/30">
          <img src="https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/270b73ae1e8a1fd4f1471a1987486902.png" alt="Figurinha de Recompensa Joinha" className="w-20 h-20 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-accent">Recompensa Desbloqueada!</h3>
          <p className="text-muted-foreground">Você é demais! Continue assim!</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
  
  const renderYesNoQuestion = (question, category, subCategory, value) => (
    <div className="py-3 px-2">
      <p className="font-medium mb-3 text-sm">{question}</p>
      <RadioGroup value={value} onValueChange={(val) => handleRadioChange(category, subCategory, val)} className="flex gap-4">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="sim" id={`${category}-${subCategory}-sim`} />
          <Label htmlFor={`${category}-${subCategory}-sim`}>Sim</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="nao" id={`${category}-${subCategory}-nao`} />
          <Label htmlFor={`${category}-${subCategory}-nao`}>Não</Label>
        </div>
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
           <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
            <Card className="bg-gradient-to-r from-primary to-secondary border-0 shadow-lg">
              <CardContent className="p-6 flex items-center justify-center text-white">
                <img src="https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/b9ec0951035217668017ae0ca49f7c4d.png" alt="Figurinha de Incentivo" className="w-16 h-16 mr-4" />
                <div>
                  <h3 className="text-xl font-bold mb-1">Você está no caminho certo!</h3>
                  <p className="text-sm">Continue marcando seus hábitos e veja sua evolução!</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <Card className="shadow-lg">
            <CardHeader><CardTitle className="text-primary">Atividades de Hoje</CardTitle><CardDescription>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</CardDescription></CardHeader>
            <CardContent>
              {renderReward(showDailyReward)}
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
                        <RadioGroup value={dailyChecklist.feelings} onValueChange={handleFeelingChange} className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                           {feelingOptions.map(option => (
                            <div key={option.id}>
                               <RadioGroupItem value={option.id} id={option.id} className="sr-only"/>
                               <Label htmlFor={option.id} className={`flex flex-col items-center justify-center p-2 border-2 rounded-lg cursor-pointer transition-all text-center ${dailyChecklist.feelings === option.id ? 'border-primary bg-primary/10' : 'border-muted hover:border-primary/50'}`}>
                                 <span className="text-2xl mb-1">{option.icon}</span>
                                 <span className="text-xs font-medium">{option.text}</span>
                               </Label>
                            </div>
                           ))}
                        </RadioGroup>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="alimentacao-consciente">
                    <AccordionTrigger className="text-lg font-semibold text-primary/90"><Brain className="w-5 h-5 mr-2"/> Alimentação Consciente</AccordionTrigger>
                    <AccordionContent className="divide-y">
                        {renderYesNoQuestion("Evitei distrações (TV, celular) nas refeições?", "consciousEating", "distractions", dailyChecklist.consciousEating?.distractions)}
                        {renderYesNoQuestion("Mastiguei devagar e saboreei os alimentos?", "consciousEating", "chewing", dailyChecklist.consciousEating?.chewing)}
                        {renderYesNoQuestion("Fiz minhas refeições sentado(a) à mesa, sempre que possível?", "consciousEating", "seatedAtTable", dailyChecklist.consciousEating?.seatedAtTable)}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="fome-saciedade">
                    <AccordionTrigger className="text-lg font-semibold text-primary/90"><Utensils className="w-5 h-5 mr-2"/> Fome e Saciedade</AccordionTrigger>
                    <AccordionContent className="divide-y">
                       {renderYesNoQuestion("Prestei atenção aos sinais de fome antes de comer?", "hungerSatiety", "hungerCues", dailyChecklist.hungerSatiety?.hungerCues)}
                       {renderYesNoQuestion("Parei de comer ao me sentir satisfeito(a)?", "hungerSatiety", "satietyCues", dailyChecklist.hungerSatiety?.satietyCues)}
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="qualidade-alimentar">
                    <AccordionTrigger className="text-lg font-semibold text-primary/90"><Salad className="w-5 h-5 mr-2"/> Qualidade Alimentar</AccordionTrigger>
                    <AccordionContent className="divide-y">
                       {renderYesNoQuestion("Incluí fontes de fibras (frutas, vegetais, integrais) nas refeições?", "foodQuality", "fiberSources", dailyChecklist.foodQuality?.fiberSources)}
                       {renderYesNoQuestion("Variei os alimentos dentro das opções do plano?", "foodQuality", "varietyInPlan", dailyChecklist.foodQuality?.varietyInPlan)}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="planejamento">
                    <AccordionTrigger className="text-lg font-semibold text-primary/90"><PenSquare className="w-5 h-5 mr-2"/> Planejamento</AccordionTrigger>
                    <AccordionContent className="divide-y">
                       {renderYesNoQuestion("Consegui seguir o planejamento alimentar do dia?", "planning", "followedPlan", dailyChecklist.planning?.followedPlan)}
                       {renderYesNoQuestion("Já pensei/planejei as refeições de amanhã?", "planning", "plannedTomorrow", dailyChecklist.planning?.plannedTomorrow)}
                    </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="weekly" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
                <Card className="bg-gradient-to-r from-primary to-secondary border-0 shadow-lg">
                <CardContent className="p-6 flex items-center justify-center text-white">
                    <img src="https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/b9ec0951035217668017ae0ca49f7c4d.png" alt="Figurinha de Incentivo Semanal" className="w-16 h-16 mr-4" />
                    <div>
                    <h3 className="text-xl font-bold mb-1">Reflexão Semanal</h3>
                    <p className="text-sm">Lembre-se: O objetivo não é a perfeição, mas sim o progresso e o autoconhecimento. Use esses checklists como guias para observar seus hábitos e fazer ajustes gentis ao longo do caminho. Celebre cada pequena vitória!</p>
                    </div>
                </CardContent>
                </Card>
            </motion.div>
           <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between text-primary">
                        <div className="flex items-center"><Calendar className="w-6 h-6 mr-2" />Checklist Semanal</div>
                        <div className="text-sm bg-primary/20 text-primary px-3 py-1 rounded-full font-semibold">{getProgress(weeklyChecklist)}%</div>
                    </CardTitle>
                    <CardDescription>Semana de {getWeekStart().toLocaleDateString('pt-BR', {day: 'numeric', month: 'short'})}</CardDescription>
                </CardHeader>
                <CardContent>
                    {renderReward(showWeeklyReward)}
                    <div className="space-y-3">
                        {weeklyChecklist.map((item, index) => (
                        <motion.div 
                            key={item.id} 
                            initial={{ opacity: 0, x: -20 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            transition={{ delay: index * 0.05 }} 
                            className={`p-3 rounded-lg border transition-all ${item.completed ? 'bg-primary/10 border-primary/30' : 'bg-card hover:bg-muted/50'}`}
                        >
                            {item.isQuestion ? (
                                 <div className="py-1">
                                    <p className="font-medium mb-2 text-sm">{item.text}</p>
                                    <RadioGroup value={item.answer} onValueChange={(val) => handleWeeklyQuestionChange(item.id, val)} className="flex gap-4">
                                        <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="sim" id={`weekly-q-${item.id}-sim`} />
                                        <Label htmlFor={`weekly-q-${item.id}-sim`}>Sim</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="nao" id={`weekly-q-${item.id}-nao`} />
                                        <Label htmlFor={`weekly-q-${item.id}-nao`}>Não</Label>
                                        </div>
                                    </RadioGroup>
                                 </div>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    <Checkbox id={`weekly-${item.id}`} checked={item.completed} onCheckedChange={() => toggleWeeklyItem(item.id)} />
                                    <img src={item.icon} alt={item.text} className="w-8 h-8 object-contain" />
                                    <label htmlFor={`weekly-${item.id}`} className={`flex-1 cursor-pointer ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{item.text}</label>
                                </div>
                            )}
                        </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-lg border-primary/20 bg-primary/5">
                <CardHeader>
                    <CardTitle className="text-primary flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Checklist R.E.A.L. Semanal
                    </CardTitle>
                    <CardDescription>Reflexão sobre sua relação com a comida nesta semana.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        {realChecklist.map((item) => (
                            <div key={item.id} className="p-4 bg-white rounded-lg shadow-sm border border-primary/10">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-2xl">{item.icon}</span>
                                    <p className="font-semibold text-primary">{item.id} - {item.text}</p>
                                </div>
                                <RadioGroup 
                                    value={realAnswers[item.id]} 
                                    onValueChange={(val) => handleRealToggle(item.id, val)} 
                                    className="flex gap-6 ml-9"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="sim" id={`real-${item.id}-sim`} />
                                        <Label htmlFor={`real-${item.id}-sim`} className="cursor-pointer">Sim</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="nao" id={`real-${item.id}-nao`} />
                                        <Label htmlFor={`real-${item.id}-nao`} className="cursor-pointer">Não</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        ))}
                    </div>

                    {getPredominantLetter() && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-4 bg-primary text-primary-foreground rounded-lg shadow-md"
                        >
                            <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                                <Award className="w-5 h-5" />
                                Resumo da Semana: Letra {getPredominantLetter()}
                            </h4>
                            <p className="text-sm leading-relaxed">
                                {getLetterFeedback(getPredominantLetter())}
                            </p>
                        </motion.div>
                    )}

                    <div className="pt-4 border-t border-primary/20">
                        <Label htmlFor="closing-question" className="text-primary font-bold mb-2 block">
                            Pergunta de Fechamento: O que você mais se orgulha de ter feito por você nesta semana?
                        </Label>
                        <Textarea 
                            id="closing-question" 
                            placeholder="Escreva aqui seu momento de orgulho..." 
                            value={nextWeekGoal} 
                            onChange={handleNextWeekGoalChange} 
                            className="min-h-[100px] bg-white" 
                        />
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChecklistManager;