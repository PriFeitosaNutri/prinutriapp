import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const MealPlan = ({ user }) => {
  const plan = user?.meal_plan || '';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-primary"><BookOpen className="w-6 h-6 mr-2" />Seu Plano Alimentar</CardTitle>
          <CardDescription>Aqui está o plano alimentar que sua nutri preparou para você.</CardDescription>
        </CardHeader>
        <CardContent>
          {plan ? (
            <div className="bg-primary/5 p-4 rounded-lg">
              <pre className="bg-transparent p-0 whitespace-pre-wrap font-sans text-sm text-foreground">{plan}</pre>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <img src="https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/996e2e077276b66cf4a4650d514665c0.png" alt="Figurinha de Plano Alimentar" className="w-24 h-24 mx-auto mb-4 opacity-70" />
              <p className="text-lg">Nenhum plano alimentar encontrado.</p>
              <p className="text-sm">Sua nutricionista irá adicionar seu plano aqui em breve!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MealPlan;