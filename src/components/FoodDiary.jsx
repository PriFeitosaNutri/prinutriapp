import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Plus, Trash2, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getFoodDiary, addFoodDiaryEntry, removeFoodDiaryEntry } from '@/lib/database';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const FoodDiary = ({ user, onMealAdded }) => {
  const [meals, setMeals] = useState([]);
  const [newMeal, setNewMeal] = useState({ time: '', food: '', notes: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const mealTypes = ['Café da manhã', 'Lanche', 'Almoço', 'Lanche da tarde', 'Jantar'];
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const fetchMeals = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getFoodDiary(user.id, todayStr);
      setMeals(data || []);
    } catch (error) {
      toast({ title: "Erro ao carregar diário", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user, todayStr, toast]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  const handleAddMeal = async () => {
    if (!newMeal.time || !newMeal.food) {
      toast({ title: "Campos obrigatórios", description: "Preencha pelo menos o horário e o alimento.", variant: "destructive" });
      return;
    }

    const mealPayload = {
      user_id: user.id,
      entry_date: todayStr,
      ...newMeal,
    };

    try {
      await addFoodDiaryEntry(mealPayload);
      setNewMeal({ time: '', food: '', notes: '' });
      fetchMeals(); // Refresh list
      if (onMealAdded) onMealAdded();
      toast({ title: "Refeição adicionada! 🍽️", description: "Registrado no seu diário alimentar.", className: "bg-primary text-primary-foreground" });
    } catch (error) {
      toast({ title: "Erro ao adicionar refeição", description: error.message, variant: "destructive" });
    }
  };

  const handleRemoveMeal = async (id) => {
    try {
      await removeFoodDiaryEntry(id);
      fetchMeals(); // Refresh list
      toast({ title: "Refeição removida", description: "Item removido do diário." });
    } catch (error) {
      toast({ title: "Erro ao remover refeição", description: error.message, variant: "destructive" });
    }
  };

  const getCurrentTime = () => new Date().toTimeString().slice(0, 5);

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-primary"><Plus className="w-6 h-6 mr-2" />Adicionar Refeição</CardTitle>
          <CardDescription>Registre o que você comeu hoje</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="time">Horário</Label>
            <div className="flex gap-2">
              <Input id="time" type="time" value={newMeal.time} onChange={(e) => setNewMeal(prev => ({ ...prev, time: e.target.value }))} />
              <Button type="button" variant="outline" size="icon" onClick={() => setNewMeal(prev => ({ ...prev, time: getCurrentTime() }))}><Clock className="w-5 h-5" /></Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="food">Alimento/Refeição</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {mealTypes.map(mealType => (<Button key={mealType} type="button" variant="outline" size="sm" onClick={() => setNewMeal(prev => ({ ...prev, food: prev.food ? `${prev.food}, ${mealType}` : `${mealType}: ` }))}>{mealType}</Button>))}
            </div>
            <Textarea id="food" placeholder="Ex: Pão integral com queijo minas e café com leite" value={newMeal.food} onChange={(e) => setNewMeal(prev => ({ ...prev, food: e.target.value }))} rows={3} />
          </div>
          <Button onClick={handleAddMeal} className="w-full bg-primary hover:bg-primary/90 text-lg py-3"><Plus className="w-5 h-5 mr-2" />Adicionar Refeição</Button>
        </CardContent>
      </Card>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-primary">Diário de Hoje</CardTitle>
          <CardDescription>{format(new Date(), "eeee, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? <p>Carregando...</p> : meals.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <img src="https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/6b52ee79fba2f2d6d3f25bbd8a9a377e.png" alt="Comida Saudável" className="w-24 h-24 mx-auto mb-4 opacity-70" />
              <p className="text-lg">Nenhuma refeição registrada ainda.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {meals.map((meal, index) => (
                <motion.div key={meal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="border border-primary/20 rounded-lg p-4 bg-card hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2"><span className="font-semibold text-lg text-primary">{meal.time}</span></div>
                      <p className="text-foreground mb-1">{meal.food}</p>
                      {meal.notes && <p className="text-xs text-muted-foreground italic">"{meal.notes}"</p>}
                    </div>
                    <Button onClick={() => handleRemoveMeal(meal.id)} variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FoodDiary;