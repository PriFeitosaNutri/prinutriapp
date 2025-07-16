
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageSquare, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { getMessages } from '@/lib/database';

const ChatSection = ({ patientDetails }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { user: adminUser } = useAuth(); // The logged-in admin
  const messagesEndRef = useRef(null);
  const { toast } = useToast();

  const fetchMessages = useCallback(async () => {
    if (!adminUser || !patientDetails) return;
    setIsLoading(true);
    try {
      const data = await getMessages(adminUser.id, patientDetails.id);
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({ title: "Erro ao carregar mensagens", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [adminUser, patientDetails, toast]);

  useEffect(() => {
    fetchMessages();

    if (!adminUser || !patientDetails) return;

    const channel = supabase
      .channel(`messages-from-patient-${patientDetails.id}-to-admin-${adminUser.id}`)
      .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `receiver_id=eq.${adminUser.id}` 
      }, (payload) => {
          const fetchSenderAndSet = async () => {
              const { data: senderProfile } = await supabase.from('profiles').select('id, name, photo_url').eq('id', payload.new.sender_id).single();
              const newMessageData = {...payload.new, sender: senderProfile };
              setMessages(currentMessages => [...currentMessages, newMessageData]);
          };
          if (payload.new.sender_id === patientDetails.id) {
              fetchSenderAndSet();
          }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMessages, adminUser, patientDetails]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !adminUser || !patientDetails) return;

    const messagePayload = {
      sender_id: adminUser.id,
      receiver_id: patientDetails.id,
      content: newMessage,
    };

    const tempId = Date.now();
    const optimisticMessage = {
        ...messagePayload,
        id: tempId,
        created_at: new Date().toISOString(),
        sender: { id: adminUser.id, name: adminUser.name, photo_url: adminUser.photo_url }
    };
    setMessages(current => [...current, optimisticMessage]);
    setNewMessage('');

    try {
      const { error } = await supabase.from('messages').insert(messagePayload);
      if (error) {
        setMessages(current => current.filter(m => m.id !== tempId));
        setNewMessage(newMessage);
        throw error;
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({ title: "Erro ao enviar mensagem", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <MessageSquare className="mr-2 w-5 h-5 text-primary"/>
            <CardTitle>Chat com {patientDetails.name}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchMessages} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}/>
          </Button>
        </div>
        <CardDescription>Converse diretamente com a paciente.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 overflow-y-auto bg-muted/30 p-4 rounded-md border flex flex-col space-y-4">
          {isLoading ? (
            <div className="m-auto flex items-center text-muted-foreground"><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Carregando...</div>
          ) : messages.length === 0 ? (
            <div className="m-auto text-center text-muted-foreground">Nenhuma mensagem ainda.</div>
          ) : (
            messages.map(msg => (
              <motion.div 
                key={msg.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-end gap-2 ${msg.sender_id === adminUser.id ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender_id !== adminUser.id && (
                  <img src={msg.sender?.photo_url || `https://ui-avatars.com/api/?name=${msg.sender?.name || 'P'}&background=random`} alt={msg.sender?.name} className="w-6 h-6 rounded-full"/>
                )}
                <div className={`p-3 rounded-lg max-w-md shadow-sm ${msg.sender_id === adminUser.id ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Textarea 
            placeholder="Escreva sua resposta..." 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
            onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
            rows={1}
            className="resize-none"
            disabled={isLoading}
          />
          <Button onClick={handleSendMessage} size="icon" className="shrink-0" disabled={isLoading}>
            <Send className="w-5 h-5"/>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatSection;
