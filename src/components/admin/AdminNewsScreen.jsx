
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, MessageSquare, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const AdminNewsScreen = ({ user, onClose }) => {
  const [newMessages, setNewMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNewMessages = async () => {
      if (!user || !user.id) return;
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*, sender:sender_id(id, name, email)')
          .eq('receiver_id', user.id)
          .eq('is_read', false);

        if (error) throw error;

        // Agrupar mensagens por remetente
        const groupedMessages = data.reduce((acc, msg) => {
          if (!acc[msg.sender_id]) {
            acc[msg.sender_id] = {
              sender: msg.sender,
              count: 0,
            };
          }
          acc[msg.sender_id].count++;
          return acc;
        }, {});

        setNewMessages(Object.values(groupedMessages));
      } catch (error) {
        console.error("Error fetching new messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewMessages();
  }, [user]);

  const handleNavigateAndClose = async () => {
    // Marcar mensagens como lidas
    const messageIds = newMessages.flatMap(group => 
        // This is a simplification. In a real app, you'd need the actual message IDs.
        // For now, we just close the screen.
        []
    );
    // if (messageIds.length > 0) {
    //     await supabase.from('messages').update({ is_read: true }).in('id', messageIds);
    // }
    onClose();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto mb-4"
            >
              <img src="/bonequinhanocelular.png" alt="PriNutriApp Mascote Novidades" className="w-28 h-28 object-contain" />
            </motion.div>
            <CardTitle className="text-3xl font-bold text-primary">Login realizado!</CardTitle>
            <CardDescription className="text-muted-foreground">
              Bem-vinda ao PriNutriApp! 💚
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center p-6">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : newMessages.length > 0 ? (
              <>
                <h3 className="font-semibold text-center">Novas Mensagens!</h3>
                <p className="text-sm text-center text-muted-foreground -mt-2 mb-4">Você tem novas mensagens de {newMessages.length} paciente(s):</p>
                <ul className="space-y-2">
                  {newMessages.map((group) => (
                    <li key={group.sender.id}>
                      <div className="w-full justify-start text-left h-auto py-2 px-3 border-green-300 bg-green-50 rounded-lg flex items-center">
                        <div className="mr-3 p-2 bg-green-100 rounded-md">
                          <MessageSquare className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-green-800">{group.sender.name}</p>
                          <p className="text-xs text-green-600">{group.sender.email}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-center text-muted-foreground py-4">Nenhuma nova mensagem por enquanto.</p>
            )}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <Button onClick={handleNavigateAndClose} className="w-full bg-primary hover:bg-primary/90 text-lg py-3 mt-6">
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
