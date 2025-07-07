import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  Users,
  FileText,
  BarChart3,
  CheckCircle,
  Clock,
  MessageSquare,
  Send,
  LogOut,
  Plus,
  Trash2,
  Droplets,
  BookOpen,
  Link as LinkIcon,
  ShoppingCart,
  ClipboardList,
  Activity,
  Bell
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabaseClient'; // Importar o cliente Supabase

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AdminDashboard = ({ onLogout }) => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const { toast } = useToast();

  const [shoppingList, setShoppingList] = useState('');
  const [mealPlan, setMealPlan] = useState('');
  const [materials, setMaterials] = useState([]);
  const [newMaterial, setNewMaterial] = useState({ title: '', url: '' });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const loadPatientsData = useCallback(async () => {
    try {
      const { data: anamnesisForms, error: anamnesisError } = await supabase
        .from('anamnesis_forms')
        .select('*');

      if (anamnesisError) throw anamnesisError;

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email');

      if (profilesError) throw profilesError;

      const loadedPatients = anamnesisForms.map((anamnesis) => {
        const profile = profiles.find((p) => p.id === anamnesis.user_id);
        return {
          id: anamnesis.id,
          name: anamnesis.name || (profile ? profile.email.split('@')[0] : 'N/A'),
          email: profile ? profile.email : 'N/A',
          status: 'approved', // Assuming all Supabase patients are approved for now
          anamnesis: anamnesis,
          hasUnreadMessages: false, // Messages will be handled separately
        };
      });
      setPatients(loadedPatients);
    } catch (error) {
      console.error('Error loading patients from Supabase:', error.message);
      toast({
        title: 'Erro ao carregar pacientes',
        description: 'Não foi possível carregar os dados dos pacientes do Supabase.',
        variant: 'destructive',
      });
      setPatients([]);
    }
  }, [toast]);

  useEffect(() => {
    loadPatientsData();
    const interval = setInterval(loadPatientsData, 5000);
    return () => clearInterval(interval);
  }, [loadPatientsData]);

  const approvePatient = async (patientEmail) => {
    try {
      const patientToApprove = patients.find(p => p.email === patientEmail);
      if (!patientToApprove) return;

      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: true })
        .eq('email', patientEmail);

      if (error) throw error;

      setPatients(prev => prev.map(p =>
        p.email === patientEmail ? { ...p, status: 'approved' } : p
      ));
      if (selectedPatient && selectedPatient.email === patientEmail) {
        setSelectedPatient(prev => ({...prev, status: 'approved'}));
      }
      toast({
        title: 'Paciente aprovada!',
        description: `${patientEmail} agora tem acesso completo ao PriNutriApp.`,
        className: 'bg-primary text-primary-foreground'
      });
    } catch (error) {
      console.error('Error approving patient:', error.message);
      toast({
        title: 'Erro ao aprovar paciente',
        description: `Não foi possível aprovar ${patientEmail}.`,
        variant: 'destructive',
      });
    }
  };

  const fetchPatientDetails = async (patient) => {
    if (!patient || !patient.email) return null;

    const today = new Date().toDateString();
    const anamnesis = patient.anamnesis || {};

    // Fetch data from Supabase instead of localStorage
    const { data: waterGoalData, error: waterGoalError } = await supabase
      .from('user_metrics')
      .select('water_goal')
      .eq('user_id', patient.id)
      .single();
    const waterGoal = waterGoalData?.water_goal || 2000;

    const { data: waterIntakeData, error: waterIntakeError } = await supabase
      .from('user_metrics')
      .select('water_intake')
      .eq('user_id', patient.id)
      .eq('date', today)
      .single();
    const waterIntakeToday = waterIntakeData?.water_intake || 0;

    const { data: mealsData, error: mealsError } = await supabase
      .from('food_diary_entries')
      .select('food')
      .eq('user_id', patient.id)
      .eq('date', today);
    const mealsToday = mealsData || [];

    const { data: dailyChecklistData, error: dailyChecklistError } = await supabase
      .from('daily_checklists')
      .select('habits, feelings')
      .eq('user_id', patient.id)
      .eq('date', today)
      .single();
    let dailyChecklist = dailyChecklistData || { habits: [], feelings: null };

    const completedHabits = dailyChecklist.habits?.filter(h => h.completed).length || 0;
    const totalHabits = dailyChecklist.habits?.length || 0;

    return {
      name: patient.name,
      email: patient.email,
      anamnesisSummary: {
        age: anamnesis.age,
        weight: anamnesis.weight,
        height: anamnesis.height,
        goals: anamnesis.goals,
        weightLossGoal: anamnesis.weightLossGoal,
        medicalConditions: anamnesis.medicalConditions,
        activityLevel: anamnesis.activityLevel,
      },
      hydration: {
        goal: waterGoal,
        intake: waterIntakeToday,
        progress: waterGoal > 0 ? Math.min((waterIntakeToday / waterGoal) * 100, 100) : 0,
      },
      foodDiary: {
        mealsCount: mealsToday.length,
        lastMeals: mealsToday.slice(-3).reverse(),
      },
      checklist: {
        completed: completedHabits,
        total: totalHabits,
        progress: totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0,
        feeling: dailyChecklist.feelings,
      }
    };
  };

  const markMessagesAsRead = async (patientEmail) => {
    try {
      const { data: currentMessages, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('recipient_email', patientEmail);

      if (fetchError) throw fetchError;

      const updatedMessages = currentMessages.map(msg =>
        msg.sender === 'patient' && !msg.read_by_nutri ? { ...msg, read_by_nutri: true } : msg
      );

      const { error: updateError } = await supabase
        .from('messages')
        .upsert(updatedMessages, { onConflict: 'id' });

      if (updateError) throw updateError;

      setPatients(prev => prev.map(p => p.email === patientEmail ? { ...p, hasUnreadMessages: false } : p));
    } catch (error) {
      console.error('Error marking messages as read:', error.message);
      toast({
        title: 'Erro ao marcar mensagens como lidas',
        description: 'Não foi possível atualizar o status das mensagens.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    const loadPatientSpecificData = async () => {
      if (selectedPatient) {
        setPatientDetails(await fetchPatientDetails(selectedPatient));

        const { data: shoppingListData, error: shoppingListError } = await supabase
          .from('patient_content')
          .select('shopping_list')
          .eq('user_id', selectedPatient.id)
          .single();
        setShoppingList(shoppingListData?.shopping_list || '');

        const { data: mealPlanData, error: mealPlanError } = await supabase
          .from('patient_content')
          .select('meal_plan')
          .eq('user_id', selectedPatient.id)
          .single();
        setMealPlan(mealPlanData?.meal_plan || '');

        const { data: materialsData, error: materialsError } = await supabase
          .from('patient_content')
          .select('materials')
          .eq('user_id', selectedPatient.id)
          .single();
        setMaterials(materialsData?.materials || []);

        const { data: currentMessages, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('recipient_email', selectedPatient.email)
          .order('timestamp', { ascending: true });
        setMessages(currentMessages || []);

        if (currentMessages && currentMessages.some(msg => msg.sender === 'patient' && !msg.read_by_nutri)) {
          markMessagesAsRead(selectedPatient.email);
        }

      } else {
        setPatientDetails(null);
      }
    };
    loadPatientSpecificData();
  }, [selectedPatient, markMessagesAsRead]);

  const handleSaveContent = async () => {
    if (!selectedPatient) return;
    try {
      const { error } = await supabase
        .from('patient_content')
        .upsert(
          {
            user_id: selectedPatient.id,
            shopping_list: shoppingList,
            meal_plan: mealPlan,
            materials: materials,
            last_updated: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (error) throw error;

      toast({ title: 'Conteúdo salvo!', description: `As informações de ${selectedPatient.name} foram atualizadas.`, className: 'bg-primary text-primary-foreground' });
    } catch (error) {
      console.error('Error saving content:', error.message);
      toast({
        title: 'Erro ao salvar conteúdo',
        description: 'Não foi possível salvar as informações para o paciente.',
        variant: 'destructive',
      });
    }
  };

  const handleAddMaterial = () => {
    if (newMaterial.title && newMaterial.url) {
      const updatedMaterials = [...materials, newMaterial];
      setMaterials(updatedMaterials);
      setNewMaterial({ title: '', url: '' });
    }
  };

  const handleRemoveMaterial = (index) => {
    const updatedMaterials = materials.filter((_, i) => i !== index);
    setMaterials(updatedMaterials);
  };

  const handleSendMessage = async () => {
    if (!selectedPatient || newMessage.trim() === '') return;
    try {
      const message = {
        sender: 'nutri',
        recipient_email: selectedPatient.email,
        text: newMessage,
        timestamp: new Date().toISOString(),
        read_by_nutri: true, // Nutri messages are read by nutri by default
        read_by_patient: false,
      };
      const { error } = await supabase.from('messages').insert([message]);

      if (error) throw error;

      setMessages(prev => [...prev, { ...message, id: Date.now() }]); // Add a temporary ID for UI
      setNewMessage('');
      toast({ title: 'Mensagem enviada!', description: 'Sua mensagem foi enviada com sucesso.', className: 'bg-primary text-primary-foreground' });
    } catch (error) {
      console.error('Error sending message:', error.message);
      toast({
        title: 'Erro ao enviar mensagem',
        description: 'Não foi possível enviar a mensagem.',
        variant: 'destructive',
      });
    }
  };

  const barChartOptions = {
    responsive: true,
    plugins: { legend: { display: false }, title: { display: true, text: 'Progresso Diário (%)', color: 'hsl(var(--primary))' } },
    scales: { y: { beginAtZero: true, max: 100, ticks: { color: 'hsl(var(--muted-foreground))' } }, x: { ticks: { color: 'hsl(var(--muted-foreground))' } } },
  };

  const getBarChartData = () => {
    if (!patientDetails) return { labels: [], datasets: [] };
    return {
      labels: ['Hidratação', 'Checklist'],
      datasets: [
        {
          label: 'Progresso',
          data: [patientDetails.hydration.progress, patientDetails.checklist.progress],
          backgroundColor: ['rgba(59, 130, 246, 0.7)', 'rgba(239, 68, 68, 0.7)'],
          borderColor: ['rgba(59, 130, 246, 1)', 'rgba(239, 68, 68, 1)'],
          borderWidth: 1,
        },
      ],
    };
  };

  useEffect(() => {
    const unreadPatient = patients.find(p => p.hasUnreadMessages);
    if (unreadPatient) {
      toast({
        title: 'Nova Mensagem! 📬',
        description: `Você tem uma nova mensagem de ${unreadPatient.name}.`,
        className: 'bg-accent text-accent-foreground cursor-pointer',
        duration: 10000,
        onClick: () => {
          setSelectedPatient(unreadPatient);
          const tabsList = document.querySelector('[role="tablist"]');
          if (tabsList) {
            const detailsTab = tabsList.children[1];
            if (detailsTab) detailsTab.click();
          }
        }
      });
    }
  }, [patients, toast]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/20 to-primary/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div className="flex items-center mb-4 sm:mb-0">
            <img src="https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/199ce3d3822c89edc91c7aafa3cfdbd7.png" alt="PriNutriApp Logo" className="w-12 h-12 mr-3 rounded-lg" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary">PriNutriApp - Painel Nutri</h1>
              <p className="text-muted-foreground">Acompanhe suas pacientes com facilidade.</p>
            </div>
          </div>
          <Button onClick={onLogout} variant="outline" className="border-primary text-primary hover:bg-primary/10">
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>
        </div>

        <Tabs defaultValue="patients" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 bg-primary/10">
            <TabsTrigger value="patients" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">👥 Pacientes</TabsTrigger>
            <TabsTrigger value="details" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">📊 Detalhes da Paciente</TabsTrigger>
          </TabsList>

          <TabsContent value="patients">
            {patients.length === 0 ? (
              <Card className="shadow-lg"><CardContent className="text-center py-12"><Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" /><h3 className="text-xl font-semibold mb-2">Nenhuma paciente cadastrada ainda.</h3><p className="text-muted-foreground">Quando novas pacientes se registrarem, elas aparecerão aqui.</p></CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {patients.map((patient, index) => (
                  <motion.div key={patient.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <Card className="shadow-md hover:shadow-xl transition-shadow h-full flex flex-col">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <CardTitle className="text-primary">{patient.name}</CardTitle>
                            {patient.hasUnreadMessages && <Bell className="w-4 h-4 ml-2 text-accent animate-pulse" />}
                          </div>
                          <Badge variant={patient.status === 'approved' ? 'default' : 'secondary'} className={`${patient.status === 'approved' ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'} text-white`}>{patient.status === 'approved' ? 'Aprovada' : 'Pendente'}</Badge>
                        </div>
                        <CardDescription>{patient.email}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="space-y-2 text-sm mb-4">
                          <p><strong>Idade:</strong> {patient.anamnesis.age || 'N/A'}</p>
                          <p><strong>Peso:</strong> {patient.anamnesis.weight || 'N/A'} kg</p>
                          <p><strong>Objetivo Principal:</strong> {patient.anamnesis.goals || 'N/A'}</p>
                        </div>
                      </CardContent>
                      <CardContent className="border-t pt-4">
                        <div className="flex gap-2 flex-wrap">
                          {patient.status === 'pending' && (<Button onClick={() => approvePatient(patient.email)} size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground flex-grow sm:flex-grow-0"><CheckCircle className="w-4 h-4 mr-2" />Aprovar</Button>)}
                          <Button onClick={() => { setSelectedPatient(patient); toast({title: `Visualizando ${patient.name}`, description: "Vá para a aba de Detalhes."}) }} variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10 flex-grow sm:flex-grow-0"><FileText className="w-4 h-4 mr-2" />Detalhes</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="details">
            {!selectedPatient ? (
              <Card className="shadow-lg"><CardContent className="text-center py-12"><FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" /><h3 className="text-xl font-semibold mb-2">Selecione uma Paciente</h3><p className="text-muted-foreground">Escolha na aba "Pacientes" para ver os detalhes e gerenciar o conteúdo.</p></CardContent></Card>
            ) : patientDetails ? (
              <div className="space-y-6">
                <Card className="shadow-xl">
                  <CardHeader><CardTitle className="text-2xl text-primary">Relatório - {patientDetails.name}</CardTitle><CardDescription>{patientDetails.email}</CardDescription></CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-primary mb-2">Resumo da Anamnese</h3>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li><strong>Idade:</strong> {patientDetails.anamnesisSummary.age || 'N/A'}</li>
                        <li><strong>Peso Atual:</strong> {patientDetails.anamnesisSummary.weight || 'N/A'} kg</li>
                        <li><strong>Altura:</strong> {patientDetails.anamnesisSummary.height || 'N/A'} cm</li>
                        <li><strong>Meta de Perda de Peso:</strong> {patientDetails.anamnesisSummary.weightLossGoal || 'N/A'} kg</li>
                        <li><strong>Objetivos:</strong> {patientDetails.anamnesisSummary.goals || 'N/A'}</li>
                        <li><strong>Condições Médicas:</strong> {patientDetails.anamnesisSummary.medicalConditions?.join(', ') || 'Nenhuma'}</li>
                        <li><strong>Nível de Atividade:</strong> {patientDetails.anamnesisSummary.activityLevel || 'N/A'}</li>
                      </ul>
                    </div>
                    <div className="h-64">
                       <Bar options={barChartOptions} data={getBarChartData()} />
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card><CardHeader><CardTitle className="text-md flex items-center text-primary"><Droplets className="mr-2"/>Hidratação</CardTitle></CardHeader><CardContent><p>{patientDetails.hydration.intake}ml / {patientDetails.hydration.goal}ml ({patientDetails.hydration.progress.toFixed(0)}%)</p></CardContent></Card>
                    <Card><CardHeader><CardTitle className="text-md flex items-center text-primary"><BookOpen className="mr-2"/>Diário Alimentar</CardTitle></CardHeader><CardContent><p>{patientDetails.foodDiary.mealsCount} refeições hoje</p><p className="text-xs text-muted-foreground">Última: {patientDetails.foodDiary.lastMeals[0]?.food.substring(0,20) || 'N/A'}...</p></CardContent></Card>
                    <Card><CardHeader><CardTitle className="text-md flex items-center text-primary"><ClipboardList className="mr-2"/>Checklist</CardTitle></CardHeader><CardContent><p>{patientDetails.checklist.completed}/{patientDetails.checklist.total} hábitos ({patientDetails.checklist.progress.toFixed(0)}%)</p><CardContent></Card>
                </div>

                <Card>
                  <CardHeader><CardTitle className="text-xl text-primary">Gerenciar Conteúdo da Paciente</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <div><Label htmlFor="shoppingList" className="flex items-center"><ShoppingCart className="mr-2 w-4 h-4"/>Lista de Compras (um item por linha)</Label><Textarea id="shoppingList" value={shoppingList} onChange={(e) => setShoppingList(e.target.value)} rows={5} placeholder="Ex: Frango, Brócolis, Aveia..."/></div>
                    <div><Label htmlFor="mealPlan" className="flex items-center"><Activity className="mr-2 w-4 h-4"/>Plano Alimentar</Label><Textarea id="mealPlan" value={mealPlan} onChange={(e) => setMealPlan(e.target.value)} rows={10} placeholder="Ex: Café da Manhã: Ovos mexidos..."/></div>
                    <div>
                      <Label className="flex items-center"><LinkIcon className="mr-2 w-4 h-4"/>Materiais de Apoio</Label>
                      <div className="space-y-2 mb-2">
                        {materials.map((mat, index) => (<div key={index} className="flex items-center gap-2 p-2 border rounded"><Input value={mat.title} readOnly className="bg-muted/30"/><Input value={mat.url} readOnly className="bg-muted/30"/><Button variant="ghost" size="icon" onClick={() => handleRemoveMaterial(index)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button></div>))}
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-grow"><Label htmlFor="mat-title" className="text-xs">Título</Label><Input id="mat-title" placeholder="Título do Vídeo/Artigo" value={newMaterial.title} onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}/></div>
                        <div className="flex-grow"><Label htmlFor="mat-url" className="text-xs">URL</Label><Input id="mat-url" placeholder="https://youtube.com/..." value={newMaterial.url} onChange={(e) => setNewMaterial({...newMaterial, url: e.target.value})}/></div>
                        <Button onClick={handleAddMaterial} size="icon"><Plus className="w-4 h-4"/></Button>
                      </div>
                    </div>
                    <Button onClick={handleSaveContent} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Salvar Conteúdo para Paciente</Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-xl text-primary flex items-center"><MessageSquare className="mr-2"/> Chat com {patientDetails.name}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4 h-72 overflow-y-auto bg-muted/50 p-4 rounded-lg border mb-4">
                      {messages.length > 0 ? messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'nutri' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`p-3 rounded-lg max-w-xs shadow ${msg.sender === 'nutri' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                            <p>{msg.text}</p>
                            <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit'})}</p>
                          </div>
                        </div>
                      )) : <p className="text-center text-muted-foreground">Nenhuma mensagem ainda.</p>}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Textarea placeholder="Digite sua resposta..." value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage();}}} />
                      <Button onClick={handleSendMessage} size="icon"><Send className="w-4 h-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
                 <Card className="shadow-lg"><CardContent className="text-center py-12"><FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" /><h3 className="text-xl font-semibold mb-2">Carregando dados da paciente...</h3></CardContent></Card>
            )}
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;

