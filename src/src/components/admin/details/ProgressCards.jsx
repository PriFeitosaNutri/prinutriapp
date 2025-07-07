import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Droplets, BookOpen, ClipboardList, Smile, Brain, 
  Utensils, Salad, PenSquare, Award 
} from 'lucide-react';

const ProgressCards = ({ patientDetails, renderChecklistSection }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <Card>
      <CardHeader>
        <CardTitle className="text-md flex items-center text-primary">
          <Droplets className="mr-2"/>
          Hidratação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>{patientDetails.hydration.intake}ml / {patientDetails.hydration.goal}ml ({patientDetails.hydration.progress.toFixed(0)}%)</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle className="text-md flex items-center text-primary">
          <BookOpen className="mr-2"/>
          Diário Alimentar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>{patientDetails.foodDiary.mealsCount} refeições hoje</p>
        {patientDetails.foodDiary.lastMeals.length > 0 ? (
          <Accordion type="single" collapsible className="w-full mt-2">
            <AccordionItem value="last-meals">
              <AccordionTrigger className="text-xs text-muted-foreground p-1">Ver últimas refeições</AccordionTrigger>
              <AccordionContent className="text-xs space-y-1 pt-2">
                {patientDetails.foodDiary.lastMeals.map(meal => (
                  <div key={meal.id} className="border-b pb-1">
                    <p><strong>{meal.time}:</strong> {meal.food}</p>
                    {meal.notes && <p className="italic text-muted-foreground/80">"{meal.notes}"</p>}
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : <p className="text-xs text-muted-foreground">Nenhuma refeição registrada hoje.</p>}
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle className="text-md flex items-center text-primary">
          <ClipboardList className="mr-2"/>
          Checklist Diário
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>{patientDetails.checklist.completed}/{patientDetails.checklist.total} hábitos ({patientDetails.checklist.progress.toFixed(0)}%)</p>
        <Accordion type="single" collapsible className="w-full mt-2">
          <AccordionItem value="checklist-details">
            <AccordionTrigger className="text-xs text-muted-foreground p-1">Ver detalhes do checklist</AccordionTrigger>
            <AccordionContent className="text-xs space-y-2 pt-2">
              {patientDetails.checklist.habits?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-primary/90 flex items-center">
                    <Award className="w-3 h-3 mr-1"/> 
                    Hábitos Essenciais
                  </h4>
                  {patientDetails.checklist.habits.map(habit => (
                    <p key={habit.id} className={`${habit.completed ? 'text-green-600' : 'text-red-600'}`}>
                      {habit.text}: {habit.completed ? 'Concluído' : 'Pendente'}
                    </p>
                  ))}
                </div>
              )}
              {renderChecklistSection("Bem-estar Geral", <Smile className="w-3 h-3 mr-1"/>, { sentimento: patientDetails.checklist.feeling })}
              {renderChecklistSection("Alimentação Consciente", <Brain className="w-3 h-3 mr-1"/>, patientDetails.checklist.consciousEating)}
              {renderChecklistSection("Fome e Saciedade", <Utensils className="w-3 h-3 mr-1"/>, patientDetails.checklist.hungerSatiety)}
              {renderChecklistSection("Qualidade Alimentar", <Salad className="w-3 h-3 mr-1"/>, patientDetails.checklist.foodQuality)}
              {renderChecklistSection("Planejamento", <PenSquare className="w-3 h-3 mr-1"/>, patientDetails.checklist.planning)}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  </div>
);

export default ProgressCards;