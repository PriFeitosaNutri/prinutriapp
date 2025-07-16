
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  ShoppingCart, Activity, Link as LinkIcon, 
  Plus, Trash2, Save 
} from 'lucide-react';

const ContentManagementCard = ({ 
  shoppingList, 
  setShoppingList, 
  mealPlan, 
  setMealPlan, 
  materials, 
  setMaterials,
  newMaterial, 
  setNewMaterial, 
  handleAddMaterial, 
  handleRemoveMaterial, 
  handleSaveContent 
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-xl text-primary">Gerenciar Conteúdo da Paciente</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div>
        <Label htmlFor="shoppingList" className="flex items-center">
          <ShoppingCart className="mr-2 w-4 h-4"/>
          Lista de Compras (um item por linha)
        </Label>
        <Textarea 
          id="shoppingList" 
          value={shoppingList} 
          onChange={(e) => setShoppingList(e.target.value)} 
          rows={5} 
          placeholder="Ex: Frango, Brócolis, Aveia..."
        />
      </div>
      <div>
        <Label htmlFor="mealPlan" className="flex items-center">
          <Activity className="mr-2 w-4 h-4"/>
          Plano Alimentar
        </Label>
        <Textarea 
          id="mealPlan" 
          value={mealPlan} 
          onChange={(e) => setMealPlan(e.target.value)} 
          rows={10} 
          placeholder="Ex: Café da Manhã: Ovos mexidos..."
        />
      </div>
      <div>
        <Label className="flex items-center">
          <LinkIcon className="mr-2 w-4 h-4"/>
          Materiais de Apoio (Links e PDFs)
        </Label>
        <div className="space-y-2 mb-2">
          {materials.map((mat, index) => (
            <div key={index} className="flex items-center gap-2 p-2 border rounded">
              <Input value={mat.title} readOnly className="bg-muted/30"/>
              <Input value={mat.url} readOnly className="bg-muted/30"/>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleRemoveMaterial(index)} 
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-grow">
            <Label htmlFor="mat-title" className="text-xs">Título do Material</Label>
            <Input 
              id="mat-title" 
              placeholder="Título do Vídeo/Artigo/PDF" 
              value={newMaterial.title} 
              onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}
            />
          </div>
          <div className="flex-grow">
            <Label htmlFor="mat-url" className="text-xs">URL do Material</Label>
            <Input 
              id="mat-url" 
              placeholder="https://exemplo.com/video ou /arquivo.pdf" 
              value={newMaterial.url} 
              onChange={(e) => setNewMaterial({...newMaterial, url: e.target.value})}
            />
          </div>
          <Button onClick={handleAddMaterial} size="icon">
            <Plus className="w-4 h-4"/>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Para PDFs, cole o link direto para o arquivo (ex: https://site.com/meu-arquivo.pdf).
        </p>
      </div>
      <Button onClick={handleSaveContent} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center">
        <Save className="mr-2 w-4 h-4"/> 
        Salvar Conteúdo e Materiais
      </Button>
    </CardContent>
  </Card>
);

export default ContentManagementCard;
