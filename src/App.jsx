import React from 'react';
import { useUser } from '@/lib/auth';
import { useAppScreenLogic } from '@/hooks/useAppScreenLogic';
import WelcomeScreen from '@/components/WelcomeScreen';
import AnamnesisScreen from '@/components/AnamnesisScreen';
import ChatSchedulerScreen from '@/components/ChatSchedulerScreen';
import NewsScreen from '@/components/NewsScreen';
import Dashboard from '@/components/Dashboard';
import LoadingScreen from '@/components/LoadingScreen';
import AdminDashboard from '@/components/AdminDashboard';

const App = () => {
  const { user, isLoading, logout, isAdmin } = useUser();
  const {
    showNewsScreen,
    handleCloseNewsScreen,
    showPrivacyPolicy,
    setShowPrivacyPolicy,
  } = useAppScreenLogic(user, isAdmin);

  const handleLogout = () => {
    logout();
  };

  if (isLoading) r
