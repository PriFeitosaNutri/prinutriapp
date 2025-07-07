import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send } from 'lucide-react';

const ChatSection = ({ patientDetails, messages, newMessage, setNewMessage, handleSendMessage }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-xl text-primary flex items-center">
        <MessageSquare className="mr-2"/> 
        Chat com {patientDetails.name}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4 h-72 overflow-y-auto bg-muted/50 p-4 rounded-lg border mb-4">
        {messages.length > 0 ? messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'nutri' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg max-w-xs shadow ${msg.sender === 'nutri' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
              <p>{msg.text}</p>
              <p className="text-xs opacity-70 mt-1 text-right">
                {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit'})}
              </p>
            </div>
          </div>
        )) : <p className="text-center text-muted-foreground">Nenhuma mensagem ainda.</p>}
      </div>
      <div className="mt-4 flex gap-2">
        <Textarea 
          placeholder="Digite sua resposta..." 
          value={newMessage} 
          onChange={e => setNewMessage(e.target.value)} 
          onKeyPress={(e) => { 
            if (e.key === 'Enter' && !e.shiftKey) { 
              e.preventDefault(); 
              handleSendMessage();
            }
          }} 
        />
        <Button onClick={handleSendMessage} size="icon">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default ChatSection;