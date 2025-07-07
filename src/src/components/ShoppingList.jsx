import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { updateProfile } from '@/lib/database';

const ShoppingList = ({ user }) => {
  const [items, setItems] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.shopping_list) {
      // Ensure each item has a unique ID and a checked status
      const parsedItems = user.shopping_list.map((item, index) => ({
        id: item.id || `item-${index}`,
        text: item.text || item,
        checked: item.checked || false,
      }));
      setItems(parsedItems);
    }
  }, [user]);

  const handleCheckItem = async (itemId) => {
    const newItems = items.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    setItems(newItems);

    try {
      await updateProfile(user.id, { shopping_list: newItems });
    } catch (error) {
      toast({
        title: "Erro ao sincronizar",
        description: "Não foi possível salvar a alteração. Tente novamente.",
        variant: "destructive",
      });
      setItems(items); // Revert to previous state on error
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-primary"><ShoppingCart className="w-6 h-6 mr-2" />Lista de Compras</CardTitle>
        <CardDescription>Sua lista de compras personalizada. Marque os itens comprados!</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <ul className="space-y-3">
            {items.map((item, index) => (
              <motion.li key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className={`flex items-center p-3 border rounded-lg transition-colors ${item.checked ? 'bg-green-100/70 border-green-300' : 'bg-primary/5 hover:bg-muted/50'}`}>
                <Checkbox id={item.id} checked={item.checked} onCheckedChange={() => handleCheckItem(item.id)} className="mr-3 h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" />
                <Label htmlFor={item.id} className={`flex-1 cursor-pointer ${item.checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{item.text}</Label>
              </motion.li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <img src="https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/d1234b79f0eeaa4720caa0ccb90c77d7.png" alt="Figurinha de Compras" className="w-24 h-24 mx-auto mb-4 opacity-70" />
            <p className="text-lg">Sua lista de compras está vazia.</p>
            <p className="text-sm">Sua nutricionista irá adicionar os itens aqui em breve!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShoppingList;

