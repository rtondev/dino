'use client';

import { useState } from 'react';
import { authAPI } from '@/components/lib/api';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface PasswordForm {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export default function SecurityTab() {
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const handlePasswordChange = (field: keyof PasswordForm, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
  };

  const handleChangePassword = async () => {
    if (!passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password) {
      toast.error('Todos os campos de senha são obrigatórios');
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
        confirm_password: passwordForm.confirm_password,
      });

      if (response.success) {
        toast.success('Senha alterada com sucesso!');
        setPasswordForm({
          current_password: '',
          new_password: '',
          confirm_password: '',
        });
      } else {
        toast.error('Erro ao alterar senha');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Erro ao alterar senha');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white">
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
              value={passwordForm.current_password}
              onChange={(e) => handlePasswordChange('current_password', e.target.value)}
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
              value={passwordForm.new_password}
              onChange={(e) => handlePasswordChange('new_password', e.target.value)}
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
              value={passwordForm.confirm_password}
              onChange={(e) => handlePasswordChange('confirm_password', e.target.value)}
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
  );
} 