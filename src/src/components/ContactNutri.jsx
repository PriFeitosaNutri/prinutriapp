import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

const ADMIN_ID = 'd2a9a53a-5f2c-4e5a-9d1b-9e8f8c7a6b5d'; // A generic or fixed admin ID from your Supabase `profiles` table

const ContactNutri = ({ user }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    if (!user || !user.id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`(sender_id.eq.${user.id},receiver_id.eq.${ADMIN_ID}),(sender_id.eq.${ADMIN_ID},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({ title: "Erro ao carregar mensagens", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchMessages();
    
    const channel = supabase.channel(`messages:${user.id}-${ADMIN_ID}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages(currentMessages => [...currentMessages, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (message.trim() === '' || !user || !user.id) return;
    
    const messagePayload = {
      sender_id: user.id,
      receiver_id: ADMIN_ID,
      content: message,
    };

    try {
      const { error } = await supabase.from('messages').insert(messagePayload);
      if (error) throw error;
      setMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
      toast({ title: "Erro ao enviar mensagem", variant: "destructive" });
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-primary"><MessageSquare className="w-6 h-6 mr-2" />Oi, Nutri!</CardTitle>
        <CardDescription>Envie uma mensagem direta para sua nutricionista.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 h-96 overflow-y-auto bg-muted/50 p-4 rounded-lg border mb-4 flex flex-col">
          {isLoading ? <p>Carregando mensagens...</p> : messages.length > 0 ? (
            messages.map(msg => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-lg max-w-sm shadow ${msg.sender_id === user.id ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                  <p>{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="m-auto text-center text-muted-foreground">
              <img alt="Bonequinha no celular" className="w-24 h-24 mx-auto mb-4" src="https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/31720ca7583588ed2fc6afdf01325efe.png" />
              <p>Nenhuma mensagem ainda.</p>
              <p className="text-sm">Use o campo abaixo para iniciar a conversa!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex items-center gap-2">
          <Textarea placeholder="Digite sua mensagem aqui..." value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} rows={1} className="resize-none" />
          <Button onClick={handleSendMessage} size="icon" className="flex-shrink-0"><Send className="w-5 h-5" /></Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactNutri;