import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const DashboardMotivation = ({ currentMainMotivation, activeTab }) => {
  if (!currentMainMotivation || !currentMainMotivation.img || !currentMainMotivation.text) {
    return null;
  }

  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
      <Card className={`bg-gradient-to-r ${activeTab === 'water' ? 'from-primary to-green-400' : 'from-accent to-red-400'} border-0 shadow-lg`}>
        <CardContent className="p-4 flex items-center">
          <img src={currentMainMotivation.img} alt="Figurinha Motivacional" className="w-16 h-16 mr-4 rounded-full object-contain" />
          <div className="text-white">
            <Sparkles className="w-5 h-5 mb-1" />
            <p className="font-semibold text-lg">{currentMainMotivation.text}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DashboardMotivation;