// src/components/AnamnesisScreen.jsx
import React from 'react';
import AnamnesisForm from './AnamnesisForm';

const AnamnesisScreen = ({ user }) => {
  const handleComplete = () => {
    // lógica de pós-envio, pode redirecionar ou dar um feedback
    console.log("Anamnese completa!");
  };

  return <AnamnesisForm user={user} onComplete={handleComplete} />;
};

export default AnamnesisScreen;
