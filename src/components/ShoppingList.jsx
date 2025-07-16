import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { updateProfile, getProfile } from '@/lib/database';

const ShoppingList = ({ user }) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadShoppingList = useCallback(async () => {
    setIsLoading(true);
    try {
      const profile = await getProfile(user.id);
      const listData = profile?.shopping_list || [];
      
      let parsedItems = [];
      if (Array.isArray(listData)) {
        if (listData.length > 0 && typeof listData[0] === 'object' && 'text' in listData[0]) {
          parsedItems = listData.map((item, index) => ({ id: `item-${index}-${Date.now()}`, ...item }));
        } else {
          parsedItems = listData
            .filter(item => typeof item === 'string' && item.trim() !== '')
            .map((itemText, index) => ({
              id: `item-${index}-${Date.now()}`,
              text: itemText,
              checked: false,
            }));
        }
      }
      setItems(parsedItems);
    } catch (error) {
      toast({
        title: "Erro ao carregar a lista",
        description: "Não foi possível buscar sua lista de compras.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user.id, toast]);

  useEffect(() => {
    loadShoppingList();
  }, [loadShoppingList]);

  const handleCheckItem = async (itemId) => {
    const newItems = items.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    setItems(newItems);

    try {
      const itemsToSave = newItems.map(({ text, checked }) => ({ text, checked }));
      await updateProfile(user.id, { shopping_list: itemsToSave });
    } catch (error) {
      toast({
        title: "Erro ao sincronizar",
        description: "Não foi possível salvar a alteração. Tente novamente.",
        variant: "destructive",
      });
      // Revert state on failure by reloading from DB
      await loadShoppingList();
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex items-center justify-center p-10">
          <Loader2 className="w-6 h-6 mr-2 animate-spin text-primary" />
          <p>Carregando sua lista de compras...</p>
        </CardContent>
      </Card>
    );
  }

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
              <motion.li 
                key={item.id} 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: index * 0.05 }} 
                className={`flex items-center p-3 border rounded-lg transition-colors ${item.checked ? 'bg-green-100/70 border-green-300' : 'bg-primary/5 hover:bg-muted/50'}`}
              >
                <Checkbox 
                  id={item.id} 
                  checked={item.checked} 
                  onCheckedChange={() => handleCheckItem(item.id)} 
                  className="mr-3 h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" 
                />
                <Label htmlFor={item.id} className={`flex-1 cursor-pointer ${item.checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {item.text}
                </Label>
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