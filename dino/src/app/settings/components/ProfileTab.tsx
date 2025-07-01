'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/components/lib/store';
import { authAPI } from '@/components/lib/api';
import { User, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface UserSettings {
  name: string;
  email: string;
  age: number;
  institution: string;
}

export default function ProfileTab() {
  const { user, updateUser } = useAuthStore();
  const [settings, setSettings] = useState<UserSettings>({
    name: user?.username || '',
    email: user?.email || '',
    age: user?.age || 0,
    institution: user?.institution || '',
  });
  const [loading, setLoading] = useState(false);

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

  const handleInputChange = (field: keyof UserSettings, value: string | number) => {
    if (field === 'name') {
      const sanitizedValue = value.toString().replace(/\s+/g, '_');
      setSettings(prev => ({ ...prev, [field]: sanitizedValue }));
    } else {
      setSettings(prev => ({ ...prev, [field]: value }));
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
        if (user) {
          updateUser(response.data.user);
        }
      } else {
        toast.error(response.message || 'Erro ao atualizar perfil');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Erro ao atualizar perfil');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white">
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
  );
} 