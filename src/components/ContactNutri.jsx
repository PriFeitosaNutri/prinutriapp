
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageSquare, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { getMessages } from '@/lib/database';
import { supabase } from '@/lib/supabaseClient';

const ContactNutri = ({ user }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminId, setAdminId] = useState(null);
  const { toast } = useToast();
  const messagesEndRef = useRef(null);

  const getAdminId = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_admin', true)
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching admin ID:", error);
      toast({ title: "Erro de configuração", description: "Não foi possível encontrar o perfil da nutricionista.", variant: "destructive" });
      return null;
    }
    return data?.id;
  }, [toast]);

  const fetchMessages = useCallback(async (currentAdminId) => {
    if (!user || !user.id || !currentAdminId) return;
    setIsLoading(true);
    try {
      const data = await getMessages(user.id, currentAdminId);
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({ title: "Erro ao carregar mensagens", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    const initializeChat = async () => {
      const id = await getAdminId();
      if (id) {
        setAdminId(id);
        fetchMessages(id);
      } else {
        setIsLoading(false);
      }
    };
    initializeChat();
  }, [getAdminId, fetchMessages]);

  useEffect(() => {
    if (!adminId || !user?.id) return;

    const channel = supabase.channel(`messages-from-admin-to-${user.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`
      }, (payload) => {
        const fetchSenderAndSet = async () => {
          const { data: senderProfile } = await supabase.from('profiles').select('id, name, photo_url').eq('id', payload.new.sender_id).single();
          const newMessage = {...payload.new, sender: senderProfile };
          setMessages(currentMessages => [...currentMessages, newMessage]);
        };
        if (payload.new.sender_id === adminId) {
            fetchSenderAndSet();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, adminId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (message.trim() === '' || !user || !user.id || !adminId) return;
    
    const messagePayload = {
      sender_id: user.id,
      receiver_id: adminId,
      content: message,
    };

    const tempId = Date.now();
    const optimisticMessage = {
      ...messagePayload,
      id: tempId,
      created_at: new Date().toISOString(),
      sender: { id: user.id, name: user.name, photo_url: user.photo_url }
    };
    setMessages(current => [...current, optimisticMessage]);
    setMessage('');

    try {
      const { error } = await supabase.from('messages').insert(messagePayload);
      if (error) {
        setMessages(current => current.filter(m => m.id !== tempId));
        setMessage(message);
        throw error;
      }
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
          {isLoading ? (
            <div className="m-auto flex flex-col items-center text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
              <p>Carregando mensagens...</p>
            </div>
          ) : messages.length > 0 ? (
            messages.map(msg => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex items-end gap-2 ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                {msg.sender_id !== user.id && (
                  <img src={msg.sender?.photo_url || `https://ui-avatars.com/api/?name=${msg.sender?.name || 'N'}&background=random`} alt={msg.sender?.name} className="w-6 h-6 rounded-full"/>
                )}
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
          <Button onClick={handleSendMessage} size="icon" className="flex-shrink-0" disabled={!adminId || isLoading}><Send className="w-5 h-5" /></Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactNutri;
