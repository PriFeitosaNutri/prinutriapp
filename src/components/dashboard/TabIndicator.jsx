import React from 'react';
import { motion } from 'framer-motion';

const TabIndicator = ({ hasNotification }) => {
  if (!hasNotification) return null;
  return (
    <motion.div 
      className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    />
  );
};

export default TabIndicator;