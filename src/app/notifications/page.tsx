'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/components/lib/store';
import { notificationAPI } from '@/components/lib/api';
import { Bell, Check, Trash2, Clock, AlertCircle, Info, CheckCircle, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'activity_deadline' | 'new_class' | 'new_activity' | 'content_update' | 'general';
  related_id?: number;
  related_type?: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const [notificationsResponse, unreadResponse] = await Promise.all([
        notificationAPI.getAll(),
        notificationAPI.getUnreadCount()
      ]);
      
      if (notificationsResponse.success) {
        setNotifications(notificationsResponse.data);
      }
      
      if (unreadResponse.success) {
        setUnreadCount(unreadResponse.data.count);
      }
    } catch (error: any) {
      console.error('Erro ao carregar notificações:', error);
      toast.error('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const handleMarkAsRead = async (notification: Notification) => {
    try {
      const response = await notificationAPI.markAsRead(notification.id);
      if (response.success) {
        setNotifications(prev => prev.map(n => 
          n.id === notification.id ? { ...n, is_read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error: any) {
      console.error('Erro ao marcar como lida:', error);
      toast.error('Erro ao marcar notificação como lida');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await notificationAPI.markAllAsRead();
      if (response.success) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
        toast.success('Todas as notificações foram marcadas como lidas');
      }
    } catch (error: any) {
      console.error('Erro ao marcar todas como lidas:', error);
      toast.error('Erro ao marcar notificações como lidas');
    }
  };

  const handleDeleteNotification = async (notification: Notification) => {
    try {
      const response = await notificationAPI.delete(notification.id);
      if (response.success) {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
        if (!notification.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        toast.success('Notificação deletada');
      }
    } catch (error: any) {
      console.error('Erro ao deletar notificação:', error);
      toast.error('Erro ao deletar notificação');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'activity_deadline':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'new_class':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'new_activity':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'content_update':
        return <CheckCircle className="h-5 w-5 text-[#42026F]" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'activity_deadline':
        return 'Prazo de Atividade';
      case 'new_class':
        return 'Nova Turma';
      case 'new_activity':
        return 'Nova Atividade';
      case 'content_update':
        return 'Conteúdo Atualizado';
      default:
        return 'Geral';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Agora mesmo';
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d atrás`;
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#42026F] mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando notificações...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} não lida${unreadCount > 1 ? 's' : ''}` : 'Todas as notificações foram lidas'}
            </p>
          </div>
          
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline">
              Marcar todas como lidas
            </Button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma notificação</h3>
              <p className="text-gray-600">Você não tem notificações no momento</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card key={notification.id} className={!notification.is_read ? 'border-[#42026F]/20 bg-[#42026F]/5' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-medium ${!notification.is_read ? 'text-[#42026F]' : 'text-gray-900'}`}>
                              {notification.title}
                            </h3>
                            {!notification.is_read && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#42026F]/10 text-[#42026F]">
                                Nova
                              </span>
                            )}
                          </div>
                          
                          <p className={`text-sm ${!notification.is_read ? 'text-[#42026F]/80' : 'text-gray-600'}`}>
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(notification.created_at)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {getNotificationTypeLabel(notification.type)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 ml-4">
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification)}
                              className="h-8 w-8 p-0"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNotification(notification)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
} 