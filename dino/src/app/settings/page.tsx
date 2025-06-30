'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { authAPI, feedbackAPI } from '@/lib/api';
import {  User, Lock, Bell, LogOut, Save, Eye, EyeOff, MessageSquare, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface UserSettings {
  name: string;
  email: string;
  age: number;
  institution: string;
  current_password: string;
  new_password: string;
  confirm_password: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
}

interface FeedbackForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function SettingsPage() {
  const { user, logout, updateUser } = useAuthStore();
  const [settings, setSettings] = useState<UserSettings>({
    name: user?.username || '',
    email: user?.email || '',
    age: user?.age || 0,
    institution: user?.institution || '',
    current_password: '',
    new_password: '',
    confirm_password: '',
    notifications_enabled: true,
    email_notifications: true,
  });
  const [feedbackForm, setFeedbackForm] = useState<FeedbackForm>({
    name: user?.username || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'feedback'>('profile');

  // Atualizar settings quando o usuário carregar
  useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        name: user.username || '',
        email: user.email || '',
        age: user.age || 0,
        institution: user.institution || '',
      }));
    }
  }, [user]);

  const handleInputChange = (field: keyof UserSettings, value: string | boolean | number) => {
    if (field === 'name') {
      // Substituir espaços por underscore no username
      const sanitizedValue = value.toString().replace(/\s+/g, '_');
      setSettings(prev => ({ ...prev, [field]: sanitizedValue }));
    } else {
      setSettings(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleFeedbackChange = (field: keyof FeedbackForm, value: string) => {
    setFeedbackForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSendFeedback = async () => {
    if (!feedbackForm.name.trim() || !feedbackForm.email.trim() || !feedbackForm.subject.trim() || !feedbackForm.message.trim()) {
      toast.error('Nome, email, assunto e mensagem são obrigatórios');
      return;
    }

    try {
      setSendingFeedback(true);
      const payload = {
        name: feedbackForm.name,
        email: feedbackForm.email,
        subject: feedbackForm.subject,
        message: feedbackForm.message
      };
      console.log('[FeedbackAPI] Enviando:', payload);
      const data = await feedbackAPI.create(payload);
      console.log('[FeedbackAPI] Resposta:', data);
      if (data.success) {
        toast.success('Feedback enviado com sucesso!');
        setFeedbackForm({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error(data.message || 'Erro ao enviar feedback');
      }
    } catch (error: any) {
      console.error('Erro ao enviar feedback:', error);
      toast.error('Erro ao enviar feedback');
    } finally {
      setSendingFeedback(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!settings.name.trim() || !settings.email.trim() || !settings.institution.trim()) {
      toast.error('Nome, email e instituição são obrigatórios');
      return;
    }

    if (settings.age < 1 || settings.age > 120) {
      toast.error('Idade deve ser entre 1 e 120 anos');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.updateProfile({
        username: settings.name,
        email: settings.email,
        age: settings.age,
        institution: settings.institution,
      });

      if (response.success) {
        toast.success('Perfil atualizado com sucesso!');
        // Atualizar dados do usuário no store
        if (user) {
          updateUser(response.data.user);
        }
      } else {
        toast.error(response.message || 'Erro ao atualizar perfil');
      }
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Erro ao atualizar perfil');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!settings.current_password || !settings.new_password || !settings.confirm_password) {
      toast.error('Todos os campos de senha são obrigatórios');
      return;
    }

    if (settings.new_password !== settings.confirm_password) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (settings.new_password.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.changePassword({
        current_password: settings.current_password,
        new_password: settings.new_password,
        confirm_password: settings.confirm_password,
      });

      if (response.success) {
        toast.success('Senha alterada com sucesso!');
        setSettings(prev => ({
          ...prev,
          current_password: '',
          new_password: '',
          confirm_password: '',
        }));
      } else {
        toast.error('Erro ao alterar senha');
      }
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Erro ao alterar senha');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair?')) {
      logout();
    }
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'security', label: 'Segurança', icon: Lock },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600">
              Gerencie suas preferências e informações da conta
            </p>
          </div>
          
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:text-red-700">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-[#42026F] text-[#42026F]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações do Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome de Usuário
                  </label>
                  <Input
                    value={settings.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Seu nome de usuário"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Idade
                  </label>
                  <Input
                    type="number"
                    value={settings.age}
                    onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                    placeholder="Sua idade"
                    min="1"
                    max="120"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instituição
                  </label>
                  <Input
                    value={settings.institution}
                    onChange={(e) => handleInputChange('institution', e.target.value)}
                    placeholder="Sua instituição"
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-gray-600">
                    <p>Tipo de conta: <span className="font-medium capitalize">{user?.user_type}</span></p>
                    <p>Membro desde: <span className="font-medium">{new Date(user?.created_at || '').toLocaleDateString('pt-BR')}</span></p>
                  </div>
                  
                  <Button 
                    onClick={handleUpdateProfile} 
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Segurança da Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha Atual
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords ? 'text' : 'password'}
                      value={settings.current_password}
                      onChange={(e) => handleInputChange('current_password', e.target.value)}
                      placeholder="Digite sua senha atual"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords ? 'text' : 'password'}
                      value={settings.new_password}
                      onChange={(e) => handleInputChange('new_password', e.target.value)}
                      placeholder="Digite a nova senha"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Nova Senha
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords ? 'text' : 'password'}
                      value={settings.confirm_password}
                      onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                      placeholder="Confirme a nova senha"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handleChangePassword} 
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    {loading ? 'Alterando...' : 'Alterar Senha'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Preferências de Notificação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Notificações Gerais</h3>
                    <p className="text-sm text-gray-500">Receber notificações sobre atividades e conteúdo</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications_enabled}
                      onChange={(e) => handleInputChange('notifications_enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#42026F]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#42026F]"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Notificações por Email</h3>
                    <p className="text-sm text-gray-500">Receber atualizações por email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.email_notifications}
                      onChange={(e) => handleInputChange('email_notifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#42026F]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#42026F]"></div>
                  </label>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={() => toast.success('Preferências salvas!')}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Salvar Preferências
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feedback Tab */}
          {activeTab === 'feedback' && (
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Enviar Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Como funciona:</strong> Seu feedback será enviado diretamente por email para nossa equipe. 
                    Você verá uma mensagem de confirmação na tela quando o feedback for enviado com sucesso.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <Input
                    value={feedbackForm.name}
                    onChange={(e) => handleFeedbackChange('name', e.target.value)}
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={feedbackForm.email}
                    onChange={(e) => handleFeedbackChange('email', e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assunto *
                  </label>
                  <Input
                    value={feedbackForm.subject}
                    onChange={(e) => handleFeedbackChange('subject', e.target.value)}
                    placeholder="Digite o assunto do seu feedback"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensagem *
                  </label>
                  <textarea
                    value={feedbackForm.message}
                    onChange={(e) => handleFeedbackChange('message', e.target.value)}
                    placeholder="Descreva seu feedback, sugestão ou reporte um problema..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#42026F] resize-none"
                    rows={6}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {feedbackForm.message.split(/\s+/).filter(word => word.length > 0).length} palavras
                  </div>
                </div>
                <div className="pt-4">
                  <Button 
                    onClick={handleSendFeedback} 
                    disabled={sendingFeedback || !feedbackForm.name.trim() || !feedbackForm.email.trim() || !feedbackForm.subject.trim() || !feedbackForm.message.trim()}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {sendingFeedback ? 'Enviando...' : 'Enviar Feedback'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
} 