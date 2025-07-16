import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckSquare as CheckSquareIcon, BarChart2, Play, ShoppingCart, BookOpen, MessageSquare } from 'lucide-react';
import TabIndicator from '@/components/dashboard/TabIndicator';
import HydrationTracker from '@/components/dashboard/HydrationTracker';
import FoodDiary from '@/components/FoodDiary';
import ChecklistManager from '@/components/ChecklistManager';
import ProgressReport from '@/components/ProgressReport';
import ShoppingList from '@/components/ShoppingList';
import MealPlan from '@/components/MealPlan';
import PriNutriFlix from '@/components/PriNutriFlix';
import ContactNutri from '@/components/ContactNutri';

const DashboardTabs = ({ 
  handleTabChange, 
  notifications, 
  user, 
  hydrationData, 
  handleHydrationChange, 
  currentWaterPin, 
  totalWaterMetDays, 
  toast, 
  handleFoodDiaryEntry, 
  checkAllTasksCompletedToday, 
  currentTaskPin 
}) => {
  return (
    <Tabs defaultValue="water" onValueChange={handleTabChange} className="space-y-6">
      <div className="overflow-x-auto pb-2 -mx-2 px-2">
        <TabsList className="flex w-full min-w-max gap-1 bg-primary/10 p-1">
          <TabsTrigger value="water" className="relative flex-shrink-0 whitespace-nowrap">💧 Hidratação</TabsTrigger>
          <TabsTrigger value="food" className="relative flex-shrink-0 whitespace-nowrap">🍎 Diário</TabsTrigger>
          <TabsTrigger value="checklist" className="relative flex-shrink-0 whitespace-nowrap">
            <CheckSquareIcon className="w-4 h-4 mr-1 inline-block" />Checklist
          </TabsTrigger>
          <TabsTrigger value="progress" className="relative flex-shrink-0 whitespace-nowrap">
            <BarChart2 className="w-4 h-4 mr-1 inline-block" />Progresso
          </TabsTrigger>
          <TabsTrigger value="plan" className="relative flex-shrink-0 whitespace-nowrap">
            <BookOpen className="w-4 h-4 mr-1 inline-block"/>Plano 
            <TabIndicator hasNotification={notifications.plan} />
          </TabsTrigger>
          <TabsTrigger value="shopping" className="relative flex-shrink-0 whitespace-nowrap">
            <ShoppingCart className="w-4 h-4 mr-1 inline-block"/>Compras 
            <TabIndicator hasNotification={notifications.shopping} />
          </TabsTrigger>
          <TabsTrigger value="materials" className="relative flex-shrink-0 whitespace-nowrap">
            <Play className="w-4 h-4 mr-1 inline-block"/>PriNutriFlix 
            <TabIndicator hasNotification={notifications.materials} />
          </TabsTrigger>
          <TabsTrigger value="contact" className="relative flex-shrink-0 whitespace-nowrap">
            <MessageSquare className="w-4 h-4 mr-1 inline-block"/>Oi Nutri 
            <TabIndicator hasNotification={notifications.contact} />
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="water">
        <HydrationTracker 
          userEmail={user.email}
          initialIntake={hydrationData.intake}
          initialGoal={hydrationData.goal}
          onIntakeChange={handleHydrationChange}
          currentWaterPin={currentWaterPin}
          totalWaterMetDays={totalWaterMetDays}
          toast={toast}
        />
      </TabsContent>
      <TabsContent value="food">
        <FoodDiary user={user} onMealAdded={handleFoodDiaryEntry} />
      </TabsContent>
      <TabsContent value="checklist">
        <ChecklistManager user={user} onChecklistCompleted={checkAllTasksCompletedToday} />
      </TabsContent>
      <TabsContent value="progress">
        <ProgressReport user={user} currentTaskPin={currentTaskPin} currentWaterPin={currentWaterPin} />
      </TabsContent>
      <TabsContent value="shopping">
        <ShoppingList user={user} />
      </TabsContent>
      <TabsContent value="plan">
        <MealPlan user={user} />
      </TabsContent>
      <TabsContent value="materials">
        <PriNutriFlix user={user} />
      </TabsContent>
      <TabsContent value="contact">
        <ContactNutri user={user} />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;