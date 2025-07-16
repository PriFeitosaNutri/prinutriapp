import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Plus, Minus, Info, Award } from 'lucide-react';
import { waterPins } from '@/lib/gamification';

const HydrationTracker = ({ userEmail, initialIntake, initialGoal, onIntakeChange, currentWaterPin, totalWaterMetDays, toast }) => {
  const [waterIntake, setWaterIntake] = useState(initialIntake);
  const [waterGoal, setWaterGoal] = useState(initialGoal);
  
  const nextWaterPinToAchieve = waterPins.find(pin => pin.minDays > currentWaterPin.minDays) || currentWaterPin;

  useEffect(() => {
    setWaterIntake(initialIntake);
    setWaterGoal(initialGoal);
  }, [initialIntake, initialGoal]);

  const addWater = (amount) => {
    const newIntake = Math.min(waterIntake + amount, waterGoal + 5000);
    setWaterIntake(newIntake);
    onIntakeChange(newIntake);
    toast({ title: "Água adicionada! 💧", description: `+${amount}ml registrados com sucesso.` });
  };

  const removeWater = (amount) => {
    const newIntake = Math.max(waterIntake - amount, 0);
    setWaterIntake(newIntake);
    onIntakeChange(newIntake);
  };

  const waterPercentage = waterGoal > 0 ? Math.min((waterIntake / waterGoal) * 100, 100) : 0;
  const walkingPinPosition = Math.min(100, Math.max(0, waterPercentage));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-primary"><Droplets className="w-6 h-6 mr-2" />Controle de Hidratação</CardTitle>
            <CardDescription>Sua meta diária: <span className="font-semibold text-primary">{waterGoal}ml</span></CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <motion.div className="text-5xl font-bold text-primary mb-2" animate={waterIntake >= waterGoal ? { scale: [1, 1.2, 1], color: "hsl(var(--accent))" } : {}} transition={{ duration: 0.5 }}>{waterIntake}ml</motion.div>
              <div className="relative w-full pt-4">
                <Progress value={waterPercentage} className="h-4 [&>div]:bg-primary" />
                {nextWaterPinToAchieve && (
                  <motion.img
                    src={nextWaterPinToAchieve.image}
                    alt={`Próximo pin: ${nextWaterPinToAchieve.name}`}
                    className="w-10 h-10 object-contain rounded-full absolute top-0 -translate-y-1/2 shadow-lg border-2 border-white bg-background p-0.5"
                    style={{ left: `calc(${walkingPinPosition}% - 20px)` }} 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  />
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">{Math.round(waterPercentage)}% da meta atingida</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => addWater(250)} className="bg-primary hover:bg-primary/90"><Plus className="w-4 h-4 mr-2" />250ml</Button>
              <Button onClick={() => addWater(500)} className="bg-primary hover:bg-primary/90"><Plus className="w-4 h-4 mr-2" />500ml</Button>
              <Button onClick={() => removeWater(250)} variant="outline" className="border-primary text-primary hover:bg-primary/10"><Minus className="w-4 h-4 mr-2" />250ml</Button>
              <Button onClick={() => removeWater(500)} variant="outline" className="border-primary text-primary hover:bg-primary/10"><Minus className="w-4 h-4 mr-2" />500ml</Button>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-center text-primary mb-1">Progresso para o Próximo Pin de Hidratação:</p>
              <div className="flex justify-center items-center space-x-1 h-8 bg-muted/50 rounded-full p-1">
                {[...Array(5)].map((_, i) => ( 
                  <motion.div 
                    key={i} 
                    className={`w-full h-full rounded-full ${i < (totalWaterMetDays % 5) ? 'bg-green-500' : 'bg-muted'}`}
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-1">{totalWaterMetDays % 5} de 5 dias com meta batida para o próximo pin.</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center gap-4"> <Info className="w-6 h-6 text-primary" /> <div> <CardTitle className="text-primary text-base">Dica da Nutri</CardTitle> <CardDescription className="text-xs">Tenha sempre uma garrafinha de água por perto. Isso ajuda a lembrar de se hidratar!</CardDescription> </div> </CardHeader>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-primary">Seu Pin de Hidratação</CardTitle>
          <div className="flex items-center text-sm text-amber-500 font-semibold"> <Award className="w-5 h-5 mr-1"/> {currentWaterPin.name} </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-full text-center space-y-2">
          <AnimatePresence>
            {waterIntake >= waterGoal ? (
              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="flex flex-col items-center">
                <img src="https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/31f5e29e1f761be5f29e7bebba93f00d.png" alt="Figurinha Batendo Palmas" className="w-32 h-32 mb-2 object-contain" />
                <h3 className="text-2xl font-bold text-accent">Parabéns!</h3>
                <p className="text-muted-foreground">Meta diária batida!</p>
                <p className="text-sm text-primary mt-1">Você está mais perto de ganhar seu próximo pin!</p>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                <motion.img src={currentWaterPin.image} alt={currentWaterPin.name} className="w-28 h-28 mb-2 object-contain" animate={{ y: [0, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} />
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                  <p className="text-muted-foreground text-sm">Continue bebendo água para conquistar sua meta!</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default HydrationTracker;