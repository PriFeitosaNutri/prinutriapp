import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { parseISO } from 'date-fns';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const ADMIN_EMAILS_LIST = ['admin@prinutriapp.com', 'suportefitlindaoficial@gmail.com'];
const normalizeEmailForAdmin = (emailStr) => emailStr.toLowerCase().trim();

export const loadPatientsDataFromLocalStorage = () => {
  const allKeys = Object.keys(localStorage);
  const patientEmails = new Set();

  allKeys.forEach(key => {
    if (key.startsWith('userAccount_') && key.endsWith('_PriNutriApp')) {
      const email = normalizeEmailForAdmin(key.substring('userAccount_'.length, key.lastIndexOf('_PriNutriApp')));
      if (email && !ADMIN_EMAILS_LIST.includes(email)) {
        patientEmails.add(email);
      }
    }
  });

  const globalRegistry = JSON.parse(localStorage.getItem('globalUserRegistry_PriNutriApp') || '[]');
  globalRegistry.forEach(user => {
    const normalizedEmail = normalizeEmailForAdmin(user.email);
    if (normalizedEmail && !ADMIN_EMAILS_LIST.includes(normalizedEmail)) {
      patientEmails.add(normalizedEmail);
    }
  });

  const globalAppointments = JSON.parse(localStorage.getItem('globalAppointments_PriNutriApp') || []);

  return Array.from(patientEmails).map((email, index) => {
    let userAccount = null;
    let anamnesisData = {};
    
    const accountKey = `userAccount_${email}_PriNutriApp`;
    const accountData = localStorage.getItem(accountKey);
    if (accountData) {
      try {
        userAccount = JSON.parse(accountData);
      } catch (e) {
        console.error(`Error parsing account data for ${email}:`, e);
      }
    }
    
    const anamnesisKey = `anamnesis_${email}_PriNutriApp`;
    const rawAnamnesisData = localStorage.getItem(anamnesisKey);
    if (rawAnamnesisData) {
      try {
        anamnesisData = JSON.parse(rawAnamnesisData);
      } catch (e) {
        console.error(`Error parsing anamnesis data for ${email}:`, e);
      }
    }
    
    if (!userAccount) {
       const registryUser = globalRegistry.find(u => normalizeEmailForAdmin(u.email) === email);
       if(registryUser){
           userAccount = {
               email: registryUser.email,
               name: registryUser.name || email.split('@')[0],
               whatsapp: registryUser.whatsapp || '',
               createdAt: registryUser.registeredAt || new Date().toISOString()
           }
       } else {
            userAccount = {
                email: email,
                name: email.split('@')[0],
                whatsapp: '',
                createdAt: new Date().toISOString()
            };
       }
    }

    const isApproved = localStorage.getItem(`approved_${email}_PriNutriApp`) === 'true';
    const patientMessages = JSON.parse(localStorage.getItem(`messages_${email}_PriNutriApp`) || '[]');
    const unreadMessages = patientMessages.filter(msg => msg.sender === 'patient' && !msg.readByNutri).length > 0;
    
    const patientInitialAppointment = globalAppointments.find(app => normalizeEmailForAdmin(app.patientEmail) === email);

    return {
      id: index + 1,
      name: userAccount.name || anamnesisData.name || email.split('@')[0],
      email: email,
      whatsapp: userAccount.whatsapp || anamnesisData.whatsapp || '',
      status: isApproved ? "approved" : "pending",
      anamnesis: anamnesisData, 
      hasUnreadMessages: unreadMessages,
      initialAppointmentDateTime: patientInitialAppointment ? patientInitialAppointment.dateTime : null,
    };
  });
};

export const fetchPatientDetailsFromLocalStorage = (patient) => {
  if (!patient || !patient.email) return null;
  
  const today = new Date().toDateString();
  const email = normalizeEmailForAdmin(patient.email);
  
  let userAccount = {};
  let anamnesis = {};
  
  const accountKey = `userAccount_${email}_PriNutriApp`;
  const accountData = localStorage.getItem(accountKey);
  if (accountData) {
    try {
      userAccount = JSON.parse(accountData);
    } catch (e) {
      console.error(`Error parsing user account for ${email}:`, e);
    }
  }
  
  const anamnesisKey = `anamnesis_${email}_PriNutriApp`;
  const rawAnamnesisData = localStorage.getItem(anamnesisKey);
  if (rawAnamnesisData) {
    try {
      anamnesis = JSON.parse(rawAnamnesisData);
    } catch (e) {
      console.error(`Error parsing anamnesis for ${email}:`, e);
      anamnesis = patient.anamnesis || {};
    }
  } else {
    anamnesis = patient.anamnesis || {};
  }
  
  const waterGoal = parseInt(localStorage.getItem(`waterGoal_${email}_PriNutriApp`)) || 2000;
  const waterIntakeToday = parseInt(localStorage.getItem(`waterIntake_${email}_${today}_PriNutriApp`)) || 0;
  
  const mealsToday = JSON.parse(localStorage.getItem(`mealsV2_${email}_${today}_PriNutriApp`) || '[]');
  
  const dailyChecklistRaw = localStorage.getItem(`dailyChecklistV3_${email}_${today}_PriNutriApp`);
  let dailyChecklist = { habits: [], feelings: null, consciousEating: {}, hungerSatiety: {}, foodQuality: {}, planning: {} };
  if (dailyChecklistRaw) {
      try {
          const parsedChecklist = JSON.parse(dailyChecklistRaw);
          dailyChecklist = {
            ...dailyChecklist,
            ...parsedChecklist,
            habits: parsedChecklist.habits || [],
          };
      } catch (e) { 
        console.error("Error parsing daily checklist for admin", e); 
      }
  }
  const completedHabits = dailyChecklist.habits?.filter(h => h.completed).length || 0;
  const totalHabits = dailyChecklist.habits?.length || 0;

  const shoppingList = localStorage.getItem(`shoppingList_${email}_PriNutriApp`) || '';
  const mealPlan = localStorage.getItem(`mealPlan_${email}_PriNutriApp`) || '';
  const materials = JSON.parse(localStorage.getItem(`materials_${email}_PriNutriApp`) || '[]');
  const messages = JSON.parse(localStorage.getItem(`messages_${email}_PriNutriApp`) || '[]');
  const manualMetrics = JSON.parse(localStorage.getItem(`manualMetrics_${email}_PriNutriApp`) || '{}');

  return { 
    name: userAccount.name || patient.name, 
    email: patient.email,
    whatsapp: userAccount.whatsapp || anamnesis.whatsapp || '',
    anamnesisSummary: { 
      age: anamnesis.age, 
      weight: anamnesis.weight, 
      height: anamnesis.height, 
      goals: anamnesis.goals, 
      weightLossGoal: anamnesis.weightLossGoal,
      medicalConditions: anamnesis.medicalConditions,
      activityLevel: anamnesis.activityLevel,
    },
    hydration: {
      goal: waterGoal,
      intake: waterIntakeToday,
      progress: waterGoal > 0 ? Math.min((waterIntakeToday / waterGoal) * 100, 100) : 0,
    },
    foodDiary: {
      mealsCount: mealsToday.length,
      lastMeals: mealsToday.slice(-3).reverse(),
      allMeals: mealsToday,
    },
    checklist: {
      completed: completedHabits,
      total: totalHabits,
      progress: totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0,
      feeling: dailyChecklist.feelings,
      habits: dailyChecklist.habits,
      consciousEating: dailyChecklist.consciousEating,
      hungerSatiety: dailyChecklist.hungerSatiety,
      foodQuality: dailyChecklist.foodQuality,
      planning: dailyChecklist.planning,
    },
    shoppingList,
    mealPlan,
    materials,
    messages,
    manualMetrics,
  };
};

export const barChartOptions = {
  responsive: true,
  plugins: { legend: { display: false }, title: { display: true, text: 'Progresso Diário (%)', color: 'hsl(var(--primary))' } },
  scales: { 
    y: { beginAtZero: true, max: 100, ticks: { color: 'hsl(var(--muted-foreground))' } }, 
    x: { ticks: { color: 'hsl(var(--muted-foreground))' } } 
  },
};

export const getBarChartData = (patientDetails) => {
  if (!patientDetails) return { labels: [], datasets: [] };
  return {
    labels: ['Hidratação', 'Checklist'],
    datasets: [
      {
        label: 'Progresso',
        data: [patientDetails.hydration.progress, patientDetails.checklist.progress],
        backgroundColor: ['rgba(59, 130, 246, 0.7)', 'rgba(239, 68, 68, 0.7)'],
        borderColor: ['rgba(59, 130, 246, 1)', 'rgba(239, 68, 68, 1)'],
        borderWidth: 1,
      },
    ],
  };
};