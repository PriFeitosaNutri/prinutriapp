import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import DCCCommunity from '@/components/community/DCCCommunity';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardMotivation from '@/components/dashboard/DashboardMotivation';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import DashboardFooter from '@/components/dashboard/DashboardFooter';
import { waterPins, taskPins, orgulhoDaNutriRewards, getCurrentWeekNumber } from '@/lib/gamification';

const Dashboard = ({ user, onLogout }) => {
  const [dailyMotivation, setDailyMotivation] = useState({ 
    text: "Hoje é um novo dia para cuidar de você!", 
    img: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/b9ec0951035217668017ae0ca49f7c4d.png" 
  });
  const [activeTab, setActiveTab] = useState('water');
  const [showDCCCommunity, setShowDCCCommunity] = useState(false);
  const [userPhoto, setUserPhoto] = useState('');
  const { toast } = useToast();

  const [notifications, setNotifications] = useState({ 
    plan: false, 
    shopping: false, 
    materials: false, 
    contact: false 
  });
  
  const [currentWaterPin, setCurrentWaterPin] = useState(waterPins[0]);
  const [totalWaterMetDays, setTotalWaterMetDays] = useState(0); 

  const [currentTaskPin, setCurrentTaskPin] = useState(taskPins[0]);
  const [totalTaskWeeksCompleted, setTotalTaskWeeksCompleted] = useState(0);
  
  const [orgulhoLevel, setOrgulhoLevel] = useState(0);
  const [hydrationData, setHydrationData] = useState({
    intake: 0,
    goal: 2000,
    motivationImage: waterPins[0].image,
  });
  const normalizedUserEmail = user.email.toLowerCase().trim();

  const getDCCTrophy = useCallback(() => {
    return currentTaskPin.image;
  }, [currentTaskPin.image]);

  const checkAllTasksCompletedToday = useCallback(() => {
    const todayStr = new Date().toDateString();
    const waterMet = (parseInt(localStorage.getItem(`waterIntake_${normalizedUserEmail}_${todayStr}_PriNutriApp`)) || 0) >= (parseInt(localStorage.getItem(`waterGoal_${normalizedUserEmail}_PriNutriApp`)) || 2000);
    
    const mealsToday = JSON.parse(localStorage.getItem(`mealsV2_${normalizedUserEmail}_${todayStr}_PriNutriApp`)) || [];
    const diaryFilled = mealsToday.length > 0;

    const checklistToday = JSON.parse(localStorage.getItem(`dailyChecklistV3_${normalizedUserEmail}_${todayStr}_PriNutriApp`)) || {};
    const essentialHabits = checklistToday.habits || [];
    const checklistCompleted = essentialHabits.length > 0 && essentialHabits.every(h => h.completed);
    
    return waterMet && diaryFilled && checklistCompleted;
  }, [normalizedUserEmail]);

  const triggerOrgulhoToast = useCallback(() => {
    const currentOrgulhoLevel = parseInt(localStorage.getItem(`orgulhoLevel_${normalizedUserEmail}_PriNutriApp`)) || 0;
    const reward = orgulhoDaNutriRewards[currentOrgulhoLevel % orgulhoDaNutriRewards.length];
    
    toast({
      title: "Orgulho da Nutri! 🌟",
      description: "Você desbloqueou uma nova figurinha por sua dedicação!",
      duration: 7000,
      className: "bg-accent text-accent-foreground",
      action: (
        <div className="p-2 rounded-md">
          <img src={reward.image} alt={reward.name} className="w-20 h-20 object-contain"/>
        </div>
      ),
    });
    localStorage.setItem(`orgulhoLevel_${normalizedUserEmail}_PriNutriApp`, (currentOrgulhoLevel + 1).toString());
    setOrgulhoLevel(currentOrgulhoLevel + 1);
  }, [toast, normalizedUserEmail]);

  const updateCurrentWaterPin = useCallback((currentTotalMetDays, showToastIfNeeded = true) => {
    let newPin = waterPins[0];
    let pinUpgraded = false;

    for (let i = waterPins.length - 1; i >= 0; i--) {
      if (currentTotalMetDays >= waterPins[i].minDays) {
        if (currentWaterPin.name !== waterPins[i].name && waterPins[i].minDays > 0) {
          pinUpgraded = true;
        }
        newPin = waterPins[i];
        break;
      }
    }
    setCurrentWaterPin(newPin);
    setHydrationData(prev => ({ ...prev, motivationImage: newPin.image }));
    
    if (pinUpgraded && showToastIfNeeded) {
      const earnedPins = JSON.parse(localStorage.getItem(`earnedPins_${normalizedUserEmail}_PriNutriApp`)) || [];
      if (!earnedPins.find(p => p.name === newPin.name && p.type === "hydration")) {
          localStorage.setItem(`earnedPins_${normalizedUserEmail}_PriNutriApp`, JSON.stringify([...earnedPins, { ...newPin, type: 'hydration' }]));
          triggerOrgulhoToast();
      }
    }
  }, [currentWaterPin.name, triggerOrgulhoToast, normalizedUserEmail]);
  
  const updateCurrentTaskPin = useCallback((currentTotalTaskWeeks, showToastIfNeeded = true) => {
    let newPin = taskPins[0];
    let pinUpgraded = false;

    for (let i = taskPins.length - 1; i >= 0; i--) {
        if (currentTotalTaskWeeks >= taskPins[i].minWeeks) {
            if (currentTaskPin.name !== taskPins[i].name && taskPins[i].minWeeks > 0) {
                pinUpgraded = true;
            }
            newPin = taskPins[i];
            break;
        }
    }
    setCurrentTaskPin(newPin);
    if (pinUpgraded && showToastIfNeeded) {
        const earnedPins = JSON.parse(localStorage.getItem(`earnedPins_${normalizedUserEmail}_PriNutriApp`)) || [];
        if (!earnedPins.find(p => p.name === newPin.name && p.type === "task")) {
            localStorage.setItem(`earnedPins_${normalizedUserEmail}_PriNutriApp`, JSON.stringify([...earnedPins, { ...newPin, type: 'task' }]));
            triggerOrgulhoToast();
        }
    }
  }, [currentTaskPin.name, triggerOrgulhoToast, normalizedUserEmail]);

  const trackDCCInteraction = useCallback((interactionType) => {
    const todayStr = new Date().toDateString();
    const userInteractionKey = `dccInteractions_${normalizedUserEmail}_${todayStr}_PriNutriApp`;
    const globalInteractionKey = `globalDCCInteractions_${todayStr}_PriNutriApp`;
    
    let userInteractions = JSON.parse(localStorage.getItem(userInteractionKey)) || [];
    let globalInteractions = JSON.parse(localStorage.getItem(globalInteractionKey)) || [];
    
    if (!userInteractions.includes(interactionType)) {
      userInteractions.push(interactionType);
      globalInteractions.push({
        userEmail: normalizedUserEmail,
        userName: user.name,
        type: interactionType,
        timestamp: new Date().toISOString()
      });
      
      localStorage.setItem(userInteractionKey, JSON.stringify(userInteractions));
      localStorage.setItem(globalInteractionKey, JSON.stringify(globalInteractions));
    }
  }, [normalizedUserEmail, user.name]);

  useEffect(() => {
    const todayStr = new Date().toDateString();
    const savedWaterIntake = localStorage.getItem(`waterIntake_${normalizedUserEmail}_${todayStr}_PriNutriApp`);
    const savedWaterGoal = localStorage.getItem(`waterGoal_${normalizedUserEmail}_PriNutriApp`);
    
    setHydrationData(prev => ({
      ...prev,
      intake: savedWaterIntake ? parseInt(savedWaterIntake) : 0,
      goal: savedWaterGoal ? parseInt(savedWaterGoal) : 2000,
    }));

    const savedTotalWaterMetDays = parseInt(localStorage.getItem(`totalWaterMetDays_${normalizedUserEmail}_PriNutriApp`)) || 0;
    setTotalWaterMetDays(savedTotalWaterMetDays);
    updateCurrentWaterPin(savedTotalWaterMetDays, false);

    const savedTotalTaskWeeks = parseInt(localStorage.getItem(`totalTaskWeeksCompleted_${normalizedUserEmail}_PriNutriApp`)) || 0;
    setTotalTaskWeeksCompleted(savedTotalTaskWeeks);
    updateCurrentTaskPin(savedTotalTaskWeeks, false);

    setOrgulhoLevel(parseInt(localStorage.getItem(`orgulhoLevel_${normalizedUserEmail}_PriNutriApp`)) || 0);
    
    const savedPhoto = localStorage.getItem(`userPhoto_${normalizedUserEmail}_PriNutriApp`) || '';
    setUserPhoto(savedPhoto);
    
    trackDCCInteraction('login');
    
    const checkUpdates = () => {
      const newNotifications = {
        plan: localStorage.getItem(`lastUpdate_mealPlan_${normalizedUserEmail}_PriNutriApp`) > (localStorage.getItem(`lastSeen_mealPlan_${normalizedUserEmail}_PriNutriApp`) || '0'),
        shopping: localStorage.getItem(`lastUpdate_shoppingList_${normalizedUserEmail}_PriNutriApp`) > (localStorage.getItem(`lastSeen_shoppingList_${normalizedUserEmail}_PriNutriApp`) || '0'),
        materials: localStorage.getItem(`lastUpdate_materials_${normalizedUserEmail}_PriNutriApp`) > (localStorage.getItem(`lastSeen_materials_${normalizedUserEmail}_PriNutriApp`) || '0'),
        contact: localStorage.getItem(`lastUpdate_messages_${normalizedUserEmail}_PriNutriApp`) > (localStorage.getItem(`lastSeen_messages_${normalizedUserEmail}_PriNutriApp`) || '0'),
      };
      setNotifications(newNotifications);
    };
    checkUpdates();
    const interval = setInterval(checkUpdates, 5000);
    return () => clearInterval(interval);
  }, [normalizedUserEmail, updateCurrentWaterPin, updateCurrentTaskPin, trackDCCInteraction]);

  useEffect(() => {
    const todayStr = new Date().toDateString();
    localStorage.setItem(`waterIntake_${normalizedUserEmail}_${todayStr}_PriNutriApp`, hydrationData.intake.toString());
    
    const goalMetTodayPreviously = localStorage.getItem(`goalMet_${normalizedUserEmail}_${todayStr}_PriNutriApp`) === 'true';

    if (hydrationData.intake >= hydrationData.goal && hydrationData.intake > 0) {
      if (!goalMetTodayPreviously) {
        localStorage.setItem(`goalMet_${normalizedUserEmail}_${todayStr}_PriNutriApp`, 'true');
        const newTotalMetDays = totalWaterMetDays + 1;
        setTotalWaterMetDays(newTotalMetDays);
        localStorage.setItem(`totalWaterMetDays_${normalizedUserEmail}_PriNutriApp`, newTotalMetDays.toString());
        updateCurrentWaterPin(newTotalMetDays);
        trackDCCInteraction('hydration');
        toast({ 
          title: "Meta diária batida! 🥳", 
          description: `Você está ${Math.max(0, 5 - (newTotalMetDays % 5 === 0 && newTotalMetDays > 0 ? 5 : newTotalMetDays % 5) )} dia(s) mais perto de ganhar seu próximo pin de hidratação!`,
          className: "bg-accent text-accent-foreground" 
        });
      }
      if (!localStorage.getItem(`celebrationShown_${normalizedUserEmail}_${todayStr}_PriNutriApp`)) {
        toast({ title: "Meta de água atingida! 🎉", description: "Parabéns por se manter hidratada!", className: "bg-primary text-primary-foreground" });
        localStorage.setItem(`celebrationShown_${normalizedUserEmail}_${todayStr}_PriNutriApp`, 'true');
      }
    }
    
    const allTasksDoneToday = checkAllTasksCompletedToday();
    const allTasksDoneKey = `allTasksDone_${normalizedUserEmail}_${todayStr}_PriNutriApp`;
    
    if (allTasksDoneToday && !localStorage.getItem(allTasksDoneKey)) {
        localStorage.setItem(allTasksDoneKey, 'true');
        trackDCCInteraction('checklist');
        const currentWeekNum = getCurrentWeekNumber();
        const dailyTaskStreakKey = `dailyTaskStreak_${normalizedUserEmail}_${currentWeekNum}_PriNutriApp`;
        let currentWeekTaskStreak = parseInt(localStorage.getItem(dailyTaskStreakKey)) || 0;
        currentWeekTaskStreak++;
        localStorage.setItem(dailyTaskStreakKey, currentWeekTaskStreak.toString());

        if (currentWeekTaskStreak >= 5) { 
            const newTotalTaskWeeks = totalTaskWeeksCompleted + 1;
            setTotalTaskWeeksCompleted(newTotalTaskWeeks);
            localStorage.setItem(`totalTaskWeeksCompleted_${normalizedUserEmail}_PriNutriApp`, newTotalTaskWeeks.toString());
            updateCurrentTaskPin(newTotalTaskWeeks);
            localStorage.setItem(dailyTaskStreakKey, '0'); 
        }
    }
  }, [hydrationData.intake, hydrationData.goal, normalizedUserEmail, toast, totalWaterMetDays, updateCurrentWaterPin, checkAllTasksCompletedToday, totalTaskWeeksCompleted, updateCurrentTaskPin, trackDCCInteraction]);

  const handleHydrationChange = (newIntake) => {
    setHydrationData(prev => ({ ...prev, intake: newIntake }));
  };

  const handleFoodDiaryEntry = () => {
    trackDCCInteraction('foodDiary');
  };

  const currentMainMotivation = activeTab === 'water' ? { text: "Cada gota conta para sua saúde!", img: hydrationData.motivationImage } : dailyMotivation;

  const handleTabChange = (value) => {
    setActiveTab(value);
    let storageKeyForLastSeen;
    let notificationStateKey = value;
    if (value === 'plan') storageKeyForLastSeen = `lastSeen_mealPlan_${normalizedUserEmail}_PriNutriApp`;
    else if (value === 'shopping') storageKeyForLastSeen = `lastSeen_shoppingList_${normalizedUserEmail}_PriNutriApp`;
    else if (value === 'materials') storageKeyForLastSeen = `lastSeen_materials_${normalizedUserEmail}_PriNutriApp`;
    else if (value === 'contact') {
      storageKeyForLastSeen = `lastSeen_messages_${normalizedUserEmail}_PriNutriApp`;
      localStorage.removeItem(`autoResponseMessageSent_${normalizedUserEmail}_PriNutriApp`);
    }
    else storageKeyForLastSeen = `lastSeen_${value}_${normalizedUserEmail}_PriNutriApp`;
    
    if (notifications[notificationStateKey]) {
      localStorage.setItem(storageKeyForLastSeen, new Date().toISOString());
      setNotifications(prev => ({ ...prev, [notificationStateKey]: false }));
    }
  };

  if (showDCCCommunity) {
    return <DCCCommunity user={user} onClose={() => setShowDCCCommunity(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/30 to-primary/30 p-4">
      <div className="max-w-6xl mx-auto">
        <DashboardHeader 
          user={user}
          currentTaskPin={currentTaskPin}
          userPhoto={userPhoto}
          setUserPhoto={setUserPhoto}
          getDCCTrophy={getDCCTrophy}
          setShowDCCCommunity={setShowDCCCommunity}
          onLogout={onLogout}
        />

        <DashboardMotivation 
          currentMainMotivation={currentMainMotivation}
          activeTab={activeTab}
        />

        <DashboardTabs 
          handleTabChange={handleTabChange}
          notifications={notifications}
          user={user}
          hydrationData={hydrationData}
          handleHydrationChange={handleHydrationChange}
          currentWaterPin={currentWaterPin}
          totalWaterMetDays={totalWaterMetDays}
          toast={toast}
          handleFoodDiaryEntry={handleFoodDiaryEntry}
          checkAllTasksCompletedToday={checkAllTasksCompletedToday}
          currentTaskPin={currentTaskPin}
        />

        <DashboardFooter />
      </div>
    </div>
  );
};

export default Dashboard;