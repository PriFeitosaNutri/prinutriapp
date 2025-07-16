import { supabase } from './supabaseClient';

const handleSupabaseError = (error, context) => {
  if (error) {
    console.error(`Supabase error in ${context}:`, error.message);
    // Adiciona um log específico para o erro de token inválido
    if (error.message.includes('Invalid Refresh Token')) {
        console.error("Detected Invalid Refresh Token. User might need to log in again.");
        // Opcional: poderia forçar um logout aqui, mas o AuthProvider já trata isso.
    }
    throw error;
  }
};

const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
};

export const getAppSetting = async (key) => {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      handleSupabaseError(error, `getAppSetting for ${key}`);
    }
    
    return data ? data.value : null;
  });
};

export const setAppSetting = async (key, value) => {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('app_settings')
      .upsert({ key, value }, { onConflict: 'key' })
      .select()
      .single();
    handleSupabaseError(error, `setAppSetting for ${key}`);
    return data;
  });
};

export const getProfile = async (userId) => {
  if (!userId) {
    console.warn("getProfile called with null or undefined userId.");
    return null;
  }
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      handleSupabaseError(error, 'getProfile');
    }
    
    return data;
  });
};

export const updateProfile = async (userId, updates) => {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...updates }, { onConflict: 'id' })
      .select()
      .single();
    handleSupabaseError(error, 'updateProfile');
    return data;
  });
};

export const saveAnamnesis = async (userId, anamnesisData) => {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('anamnesis_forms')
      .upsert({ user_id: userId, ...anamnesisData }, { onConflict: 'user_id' })
      .select()
      .single();
    handleSupabaseError(error, 'saveAnamnesis');
    return data;
  });
};

export const getFoodDiary = async (userId, date) => {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('food_diary_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('entry_date', date)
      .order('time', { ascending: true });
    
    if (error && error.code !== 'PGRST116') {
      handleSupabaseError(error, 'getFoodDiary');
    }
    
    return data || [];
  });
};

export const addFoodDiaryEntry = async (entry) => {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('food_diary_entries')
      .insert(entry)
      .select()
      .single();
    handleSupabaseError(error, 'addFoodDiaryEntry');
    return data;
  });
};

export const removeFoodDiaryEntry = async (entryId) => {
  return retryOperation(async () => {
    const { error } = await supabase
      .from('food_diary_entries')
      .delete()
      .eq('id', entryId);
    handleSupabaseError(error, 'removeFoodDiaryEntry');
  });
};

export const getDailyChecklist = async (userId, date) => {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('daily_checklists')
      .select('data')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      handleSupabaseError(error, 'getDailyChecklist');
    }
    
    return data ? data.data : null;
  });
};

export const saveDailyChecklist = async (userId, date, checklistData) => {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('daily_checklists')
      .upsert({ user_id: userId, date, data: checklistData }, { onConflict: 'user_id,date' });
    handleSupabaseError(error, 'saveDailyChecklist');
    return data;
  });
};

export const getWeeklyChecklist = async (userId, weekStartDate) => {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('weekly_checklists')
      .select('data')
      .eq('user_id', userId)
      .eq('week_start_date', weekStartDate)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      handleSupabaseError(error, 'getWeeklyChecklist');
    }
    
    return data ? data.data : null;
  });
};

export const saveWeeklyChecklist = async (userId, weekStartDate, checklistData) => {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('weekly_checklists')
      .upsert({ user_id: userId, week_start_date: weekStartDate, data: checklistData }, { onConflict: 'user_id,week_start_date' });
    handleSupabaseError(error, 'saveWeeklyChecklist');
    return data;
  });
};

export const getAllPatients = async () => {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        anamnesis_forms(*),
        appointments(*),
        patient_records(*)
      `)
      .neq("is_admin", true)
      .order("created_at", { ascending: false });
    
    if (error && error.code !== 'PGRST116') {
      handleSupabaseError(error, 'getAllPatients');
    }
    
    return data || [];
  });
};

export const getPatientDetails = async (userId) => {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        anamnesis_forms(*),
        food_diary_entries(*),
        daily_checklists(*),
        weekly_checklists(*),
        patient_records(*),
        messages:messages!receiver_id(*)
      `)
      .eq('id', userId)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      handleSupabaseError(error, 'getPatientDetails');
    }
    
    // Se não encontrou dados da anamnese na tabela anamnesis_forms, 
    // tenta buscar na tabela anamnese (caso exista)
    if (data && (!data.anamnesis_forms || data.anamnesis_forms.length === 0)) {
      try {
        const { data: anamneseData, error: anamneseError } = await supabase
          .from('anamnese')
          .select('*')
          .eq('user_id', userId);
        
        if (!anamneseError && anamneseData && anamneseData.length > 0) {
          data.anamnesis_forms = anamneseData;
        }
      } catch (e) {
        console.warn('Tabela anamnese não encontrada, usando anamnesis_forms');
      }
    }
    
    return data;
  });
};

export const getPatientRecord = async (userId) => {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('patient_records')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      handleSupabaseError(error, 'getPatientRecord');
    }
    
    return data;
  });
};

export const updatePatientRecord = async (userId, updates) => {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('patient_records')
      .upsert({ user_id: userId, ...updates }, { onConflict: 'user_id' })
      .select()
      .single();
    handleSupabaseError(error, 'updatePatientRecord');
    return data;
  });
};

export const calculatePatientMetrics = async (weight, height, age, gender = 'feminino', activityLevel = 'sedentario') => {
  return retryOperation(async () => {
    const { data, error } = await supabase.rpc('calculate_patient_metrics', {
      p_weight: weight,
      p_height: height,
      p_age: age,
      p_gender: gender,
      p_activity_level: activityLevel
    });
    handleSupabaseError(error, 'calculatePatientMetrics');
    return data;
  });
};

export const approvePatient = async (userId) => {
  return updateProfile(userId, { is_approved: true });
};

export const deletePatient = async (userId) => {
  return retryOperation(async () => {
    const { data, error } = await supabase.rpc('delete_user_and_data', { user_id_to_delete: userId });
    handleSupabaseError(error, 'deletePatient');
    return data;
  });
};

export const getMessages = async (userId1, userId2) => {
  if (!userId1 || !userId2) {
    console.warn("getMessages called with null or undefined user IDs.");
    return [];
  }
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:sender_id(id, name, photo_url)')
      .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
      .order('created_at', { ascending: true });

    if (error && error.code !== 'PGRST116') {
      handleSupabaseError(error, 'getMessages');
    }

    return data || [];
  });
};

export const getPosts = async () => {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('dcc_posts')
      .select(`
        *, 
        profiles ( name, photo_url, is_admin ), 
        dcc_interactions ( *, profiles(name, photo_url) )
      `)
      .order('created_at', { ascending: false });
    
    if (error && error.code !== 'PGRST116') {
      handleSupabaseError(error, 'getPosts');
    }
    
    return data || [];
  });
};

export const createPost = async (post) => {
  return retryOperation(async () => {
    const { data, error } = await supabase.from('dcc_posts').insert(post).select().single();
    handleSupabaseError(error, 'createPost');
    return data;
  });
};

export const likePost = async (postId, userId) => {
  return retryOperation(async () => {
    const { data, error } = await supabase.rpc('toggle_like', { _post_id: postId, _user_id: userId });
    handleSupabaseError(error, 'likePost');
    return data;
  });
};

export const addComment = async (comment) => {
  return retryOperation(async () => {
    const { data, error } = await supabase.from('dcc_interactions').insert(comment).select().single();
    handleSupabaseError(error, 'addComment');
    return data;
  });
};

export const deletePost = async (postId) => {
  return retryOperation(async () => {
    const { data: post, error: fetchError } = await supabase
      .from('dcc_posts')
      .select('media_url')
      .eq('id', postId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      handleSupabaseError(fetchError, 'deletePost (fetching post)');
    }

    if (post && post.media_url) {
      try {
        const url = new URL(post.media_url);
        const path = url.pathname.split('/community_media/')[1];
        if (path) {
          const { error: storageError } = await supabase.storage
            .from('community_media')
            .remove([path]);
          if (storageError) {
             console.error(`Storage deletion error (path: ${path}):`, storageError.message);
          }
        }
      } catch (e) {
        console.error("Error parsing media URL for deletion:", e);
      }
    }

    const { error: deleteError } = await supabase
      .from('dcc_posts')
      .delete()
      .eq('id', postId);
    
    handleSupabaseError(deleteError, 'deletePost (deleting record)');
  });
};

