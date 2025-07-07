import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { MessageSquare, ArrowRight, Users } from 'lucide-react';
import { loadPatientsDataFromLocalStorage } from '@/lib/adminUtils';

const AdminNewsScreen = ({ user, onClose }) => {
  const [patientsWithUnreadMessages, setPatientsWithUnreadMessages] = useState([]);
  const adminEmails = ['admin@prinutriapp.com', 'projetolevezadeverdade@gmail.com'];

  useEffect(() => {
    const allPatients = loadPatientsDataFromLocalStorage(adminEmails);
    const unread = allPatients.filter(p => p.hasUnreadMessages);
    setPatientsWithUnreadMessages(unread);
  }, [adminEmails]);

  const handleNavigate = () => {
    onClose(); 
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/30 to-primary/30 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto mb-4"
            >
                <img src="https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/31720ca7583588ed2fc6afdf01325efe.png" alt="Bonequinha com Celular" className="w-24 h-24" />
            </motion.div>
            <CardTitle className="text-3xl font-bold text-primary">Novas Mensagens!</CardTitle>
            <CardDescription className="text-muted-foreground">
              {patientsWithUnreadMessages.length > 0 ? `Você tem novas mensagens de ${patientsWithUnreadMessages.length} paciente(s):` : "Nenhuma nova mensagem no momento."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {patientsWithUnreadMessages.length > 0 && (
              <ul className="space-y-3 max-h-60 overflow-y-auto">
                {patientsWithUnreadMessages.map((patient, index) => (
                  <motion.li 
                    key={patient.email}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    <div 
                      className="w-full flex items-center justify-start text-left h-auto py-3 px-4 border border-primary/30 rounded-md bg-primary/5"
                    >
                      <div className="mr-3 p-2 bg-primary/10 rounded-md"><MessageSquare className="w-6 h-6 text-primary" /></div>
                      <div>
                        <p className="font-semibold text-primary">{patient.name}</p>
                        <p className="text-xs text-muted-foreground">{patient.email}</p>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: patientsWithUnreadMessages.length * 0.1 + 0.5 }}>
              <Button onClick={handleNavigate} className="w-full bg-primary hover:bg-primary/90 text-lg py-3 mt-6">
                Ir para o Painel
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminNewsScreen;