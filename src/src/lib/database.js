import { supabase } from './supabaseClient';

const handleSupabaseError = (error, context) => {
  if (error) {
    console.error(`Supabase error in ${context}:`, error.message);
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
      .select('*, anamnesis_forms(*), appointments(*)')
      .neq('is_admin', true);
    
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
        patient_records(*)
      `)
      .eq('id', userId)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      handleSupabaseError(error, 'getPatientDetails');
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

export const addMessageToChat = async (message) => {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert(message)
      .select()
      .single();
    handleSupabaseError(error, 'addMessageToChat');
    return data;
  });
};

export const getChatMessages = async (patientId) => {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .or(`sender_id.eq.${patientId},receiver_id.eq.${patientId}`)
      .order('timestamp', { ascending: true });
    
    if (error && error.code !== 'PGRST116') {
      handleSupabaseError(error, 'getChatMessages');
    }
    
    return data || [];
  });
};

