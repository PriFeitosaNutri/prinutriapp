import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Folder, ArrowLeft, Info, CheckCircle2, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import exercisesData from '@/lib/exercises_db.json';

const PhysicalActivityLibrary = ({ user, onExerciseComplete }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeExercise, setActiveExercise] = useState(null);
  const [categories, setCategories] = useState({});

  useEffect(() => {
    const grouped = exercisesData.reduce((acc, ex) => {
      if (!acc[ex.category]) acc[ex.category] = [];
      acc[ex.category].push(ex);
      return acc;
    }, {});
    setCategories(grouped);
  }, []);

  const handleComplete = (exercise) => {
    if (onExerciseComplete) {
      onExerciseComplete(exercise);
    }
    setActiveExercise(null);
  };

  if (activeExercise) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="shadow-lg overflow-hidden border-primary/20">
          <CardHeader className="bg-primary text-primary-foreground">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => setActiveExercise(null)} className="text-white hover:bg-white/20">
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <CardTitle className="text-xl font-bold truncate">{activeExercise.title}</CardTitle>
              <Dumbbell className="w-6 h-6 opacity-50" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="bg-black aspect-video flex items-center justify-center overflow-hidden">
              <img 
                src={activeExercise.gifPath.replace('/exercises/', '/exercises/')} 
                alt={activeExercise.title} 
                className="max-h-full object-contain"
              />
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold flex items-center text-primary mb-3">
                  <Info className="w-5 h-5 mr-2" /> Como Executar
                </h3>
                <ul className="space-y-2">
                  {activeExercise.steps.map((step, i) => (
                    <li key={i} className="flex items-start text-sm text-muted-foreground">
                      <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-accent/5 p-4 rounded-lg border border-accent/20">
                <h4 className="text-sm font-bold text-accent mb-1">Dica da Nutri:</h4>
                <p className="text-sm text-muted-foreground italic">"{activeExercise.tips}"</p>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1 h-12 text-lg font-bold" onClick={() => handleComplete(activeExercise)}>
                  <CheckCircle2 className="w-5 h-5 mr-2" /> Concluí este Exercício
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (selectedCategory) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => setSelectedCategory(null)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-2xl font-bold text-primary">{selectedCategory}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories[selectedCategory].map((ex) => (
            <motion.div 
              key={ex.id} 
              whileHover={{ scale: 1.03 }} 
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveExercise(ex)}
              className="cursor-pointer group"
            >
              <Card className="overflow-hidden border-none shadow-md bg-card hover:ring-2 ring-primary/50 transition-all">
                <div className="aspect-square bg-muted relative overflow-hidden">
                  <img src={ex.gifPath} alt={ex.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                    <p className="text-white text-xs font-bold line-clamp-2">{ex.title}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.keys(categories).map((cat) => (
          <motion.div 
            key={cat} 
            whileHover={{ x: 5 }} 
            onClick={() => setSelectedCategory(cat)}
            className="cursor-pointer"
          >
            <Card className="hover:bg-primary/5 transition-colors border-primary/10">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Folder className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{cat}</h3>
                    <p className="text-xs text-muted-foreground">{categories[cat].length} exercícios</p>
                  </div>
                </div>
                <Play className="w-5 h-5 text-primary opacity-50" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PhysicalActivityLibrary;
