import { useEffect, useState } from 'react';

export const useUser = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 🔁 simulação de carregamento (substitua pela lógica real)
    setTimeout(() => {
      const mockUser = {
        id: '123',
        name: 'Paciente',
        has_seen_welcome: true,
        has_scheduled_initial_chat: true,
        has_completed_anamnesis: true,
        is_approved: true,
      };
      setUser(mockUser);
      setIsAdmin(false); // ou true se for admin
      setIsLoading(false);
    }, 500);
  }, []);

  const logout = () => {
    setUser(null);
  };

  return { user, isLoading, logout, isAdmin };
};
