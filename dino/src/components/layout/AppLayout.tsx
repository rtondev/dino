'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/components/lib/store';
import { notificationAPI } from '@/components/lib/api';
import { Bell, Settings, User, LogOut, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Sidebar from './Sidebar';
import Button from '@/components/ui/Button';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, user, isInitialized, logout } = useAuthStore();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

  console.log('AppLayout - isAuthenticated:', isAuthenticated);
  console.log('AppLayout - user:', user?.username);
  console.log('AppLayout - isInitialized:', isInitialized);

  useEffect(() => {
    if (!isAuthenticated && isInitialized) {
      const currentPath = window.location.pathname;
      console.log('AppLayout - Redirecting to login from:', currentPath);
      router.push(`/login?returnUrl=${encodeURIComponent(currentPath)}`);
    }
  }, [isAuthenticated, isInitialized, router]);

  // Carregar contagem de notificações não lidas
  useEffect(() => {
    if (isAuthenticated && user) {
      const loadUnreadCount = async () => {
        try {
          const response = await notificationAPI.getUnreadCount();
          if (response.success) {
            setUnreadNotifications(response.data.count);
          }
        } catch (error) {
          console.error('Erro ao carregar notificações:', error);
        }
      };
      
      loadUnreadCount();
      
      // Atualizar a cada 30 segundos
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logout realizado com sucesso!');
      router.push('/login');
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const handleGoToSettings = () => {
    router.push('/settings');
    setShowSettingsDropdown(false);
  };

  const handleGoToNotifications = () => {
    router.push('/notifications');
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#42026F]/5 to-[#42026F]/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#42026F] mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <header className="bg-white border-b border-gray-200 px-4 lg:px-6" style={{ height: '72.8px' }}>
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center space-x-4">
                <h1 className="text-lg font-semibold text-gray-900">
                  Dino App
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Notifications Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGoToNotifications}
                  className="relative p-2"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadNotifications > 99 ? '99+' : unreadNotifications}
                    </span>
                  )}
                </Button>

                {/* Settings Dropdown */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                    className="flex items-center gap-2 p-2"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline text-sm font-medium">{user.username}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>

                  {showSettingsDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <button
                        onClick={handleGoToSettings}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <Settings className="h-4 w-4" />
                        Configurações
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-white">
            {children}
          </main>
        </div>
      </div>

      {/* Overlay para fechar dropdown quando clicar fora */}
      {showSettingsDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowSettingsDropdown(false)}
        />
      )}
    </div>
  );
} 