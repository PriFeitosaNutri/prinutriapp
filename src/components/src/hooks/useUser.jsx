import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export const useUser = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);

      if (user && user.email === 'prifeitosanutri@gmail.com') {
        setIsAdmin(true);
      }
    };

    fetchUser();
  }, []);

  return { user, isLoading, isAdmin };
};
