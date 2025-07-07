import { supabase } from "./supabaseClient";

export const fetchPatientsFromSupabase = async () => {
  try {
    const { data: anamnesisForms, error: anamnesisError } = await supabase
      .from("anamnesis_forms")
      .select("*");

    if (anamnesisError) throw anamnesisError;

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email");

    if (profilesError) throw profilesError;

    const patientData = anamnesisForms.map((anamnesis) => {
      const profile = profiles.find((p) => p.id === anamnesis.user_id);
      return {
        id: anamnesis.id,
        name: anamnesis.name || (profile ? profile.email.split("@")[0] : "N/A"),
        email: profile ? profile.email : "N/A",
        status: "approved", // Assuming all Supabase patients are approved for now
        anamnesis: anamnesis,
        hasUnreadMessages: false, // Messages will be handled separately
      };
    });
    return patientData;
  } catch (error) {
    console.error("Error fetching patients from Supabase:", error.message);
    return [];
  }
};

export const fetchPatientDetailsFromSupabase = async (patient) => {
  if (!patient || !patient.email) return null;

  const today = new Date().toDateString();
  const anamnesis = patient.anamnesis || {};

  const { data: waterGoalData, error: waterGoalError } = await supabase
    .from("user_metrics")
    .select("water_goal")
    .eq("user_id", patient.id)
    .single();
  const waterGoal = waterGoalData?.water_goal || 2000;

  const { data: waterIntakeData, error: waterIntakeError } = await supabase
    .from("user_metrics")
    .select("water_intake")
    .eq("user_id", patient.id)
    .eq("date", today)
    .single();
  const waterIntakeToday = waterIntakeData?.water_intake || 0;

  const { data: mealsData, error: mealsError } = await supabase
    .from("food_diary_entries")
    .select("food")
    .eq("user_id", patient.id)
    .eq("date", today);
  const mealsToday = mealsData || [];

  const { data: dailyChecklistData, error: dailyChecklistError } = await supabase
    .from("daily_checklists")
    .select("habits, feelings")
    .eq("user_id", patient.id)
    .eq("date", today)
    .single();
  let dailyChecklist = dailyChecklistData || { habits: [], feelings: null };

  const completedHabits = dailyChecklist.habits?.filter(h => h.completed).length || 0;
  const totalHabits = dailyChecklist.habits?.length || 0;

  return {
    name: patient.name,
    email: patient.email,
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
    },
    checklist: {
      completed: completedHabits,
      total: totalHabits,
      progress: totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0,
      feeling: dailyChecklist.feelings,
    }
  };
};

