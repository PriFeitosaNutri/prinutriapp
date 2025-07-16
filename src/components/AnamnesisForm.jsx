
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import { FileText, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { updateProfile } from '@/lib/database';

const AnamnesisForm = ({ user, onComplete }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    age: '',
    weight: '',
    height: '',
    hip: '',
    arm: '',
    thigh: '',
    waist: '',
    weight_loss_goal: '',
    activity_level: '',
    medical_conditions: [],
    medications: '',
    allergies: '',
    dietary_restrictions: '',
    goals: '',
    sleep_hours: '',
    stress_level: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const medicalOptions = [
    'Diabetes', 'Hipertensão', 'Problemas cardíacos', 'Problemas renais', 'Problemas digestivos', 'Outros'
  ];

  const handleCheckboxChange = (condition, checked) => {
    setFormData(prev => ({
      ...prev,
      medical_conditions: checked 
        ? [...prev.medical_conditions, condition]
        : prev.medical_conditions.filter(c => c !== condition)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const anamnesisPayload = {
        user_id: user.id,
        ...formData,
        weight: parseFloat(formData.weight) || null,
        height: parseInt(formData.height) || null,
        hip: parseFloat(formData.hip) || null,
        arm: parseFloat(formData.arm) || null,
        thigh: parseFloat(formData.thigh) || null,
        waist: parseFloat(formData.waist) || null,
        weight_loss_goal: parseFloat(formData.weight_loss_goal) || null,
        age: parseInt(formData.age) || null,
        sleep_hours: parseInt(formData.sleep_hours) || null,
      };

      const { error: anamnesisError } = await supabase
        .from('anamnesis_forms')
        .upsert(anamnesisPayload, { onConflict: 'user_id' });

      if (anamnesisError) throw anamnesisError;

      const waterGoal = formData.weight ? Math.round(parseFloat(formData.weight) * 35) : 2000;
      await updateProfile(user.id, { water_goal: waterGoal });

      toast({
        title: "Anamnese enviada!",
        description: "Aguarde a liberação do acesso pela sua nutricionista. 🎉",
        className: "bg-primary text-primary-foreground"
      });

      onComplete();
    } catch (error) {
      console.error("Error submitting anamnesis:", error);
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível salvar sua anamnese. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-3xl w-full mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader className="text-center">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-accent to-primary rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-primary-foreground" />
              </motion.div>
              <CardTitle className="text-2xl font-bold text-card-foreground">Anamnese Nutricional - PriNutriApp</CardTitle>
              <CardDescription>Olá, {user.name}! Preencha suas informações para um acompanhamento personalizado.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2"><Label htmlFor="name">Nome</Label><Input id="name" value={formData.name} onChange={handleInputChange} /></div>
                  <div className="space-y-2"><Label htmlFor="age">Idade</Label><Input id="age" type="number" value={formData.age} onChange={handleInputChange} /></div>
                  <div className="space-y-2"><Label htmlFor="weight">Peso (kg)</Label><Input id="weight" type="number" step="0.1" value={formData.weight} onChange={handleInputChange} /></div>
                  <div className="space-y-2"><Label htmlFor="height">Altura (cm)</Label><Input id="height" type="number" value={formData.height} onChange={handleInputChange} /></div>
                </div>
                <h2 className="text-xl font-semibold text-foreground pt-4 border-t">Medidas Corporais (cm)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2"><Label htmlFor="waist">Cintura</Label><Input id="waist" type="number" step="0.1" value={formData.waist} onChange={handleInputChange} /></div>
                  <div className="space-y-2"><Label htmlFor="hip">Quadril</Label><Input id="hip" type="number" step="0.1" value={formData.hip} onChange={handleInputChange} /></div>
                  <div className="space-y-2"><Label htmlFor="arm">Braço</Label><Input id="arm" type="number" step="0.1" value={formData.arm} onChange={handleInputChange} /></div>
                  <div className="space-y-2"><Label htmlFor="thigh">Coxa</Label><Input id="thigh" type="number" step="0.1" value={formData.thigh} onChange={handleInputChange} /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="weight_loss_goal">Meta de Perda de Peso (kg)</Label><Input id="weight_loss_goal" type="number" step="0.1" value={formData.weight_loss_goal} onChange={handleInputChange} /></div>
                  <div className="space-y-2"><Label htmlFor="activity_level">Nível de Atividade</Label><Input id="activity_level" placeholder="Sedentário, Leve, Moderado..." value={formData.activity_level} onChange={handleInputChange} /></div>
                </div>
                <h2 className="text-xl font-semibold text-foreground pt-4 border-t">Saúde e Hábitos</h2>
                <div className="space-y-3">
                  <Label>Condições Médicas</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {medicalOptions.map((condition) => (
                      <div key={condition} className="flex items-center space-x-2">
                        <Checkbox id={condition} checked={formData.medical_conditions.includes(condition)} onCheckedChange={(checked) => handleCheckboxChange(condition, checked)} />
                        <Label htmlFor={condition} className="text-sm font-normal">{condition}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2"><Label htmlFor="medications">Medicamentos em uso</Label><Textarea id="medications" value={formData.medications} onChange={handleInputChange} /></div>
                <div className="space-y-2"><Label htmlFor="allergies">Alergias Alimentares</Label><Input id="allergies" value={formData.allergies} onChange={handleInputChange} /></div>
                <div className="space-y-2"><Label htmlFor="dietary_restrictions">Restrições Alimentares</Label><Input id="dietary_restrictions" value={formData.dietary_restrictions} onChange={handleInputChange} /></div>
                <div className="space-y-2"><Label htmlFor="goals">Outros Objetivos e Observações</Label><Textarea id="goals" value={formData.goals} onChange={handleInputChange} /></div>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Enviar Anamnese'}
                  {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AnamnesisForm;
