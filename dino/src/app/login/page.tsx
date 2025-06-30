'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, BookOpen } from 'lucide-react';
import { authAPI } from '../../components/lib/api';
import { useAuthStore } from '../../components/lib/store';
import { validateEmail } from '../../components/lib/utils';
import AuthGuard from '@/components/auth/AuthGuard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    if (!validateEmail(data.email)) {
      toast.error('Email inválido');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Tentando fazer login com:', { email: data.email, password: '***' });
      const response = await authAPI.login(data.email, data.password);
      
      console.log('Login response:', response);
      
      if (response.success) {
        // Extrair token da resposta
        const token = response.data.tokens.token;
        console.log('Extracted token:', token ? 'Present' : 'Missing');
        
        if (!token) {
          throw new Error('Token não encontrado na resposta');
        }
        
        login(response.data.user, token);
        toast.success('Login realizado com sucesso!');
        
        // Redirecionar para a página original ou para classes
        const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
        if (returnUrl) {
          router.push(returnUrl);
        } else {
          router.push('/classes');
        }
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      // Tratamento específico para diferentes tipos de erro
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 401:
            toast.error('Email ou senha incorretos');
            break;
          case 400:
            toast.error(data.message || 'Dados inválidos');
            break;
          case 429:
            toast.error('Muitas tentativas. Tente novamente em alguns minutos');
            break;
          case 500:
            toast.error('Erro no servidor. Tente novamente mais tarde');
            break;
          default:
            toast.error(data.message || 'Erro ao fazer login');
        }
      } else if (error.request) {
        // Erro de rede
        toast.error('Erro de conexão. Verifique sua internet');
      } else {
        // Erro geral
        toast.error('Erro inesperado. Tente novamente');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center">
              <img src="/logo.svg" alt="Dino Logo" className="h-8 w-8" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Dino App</h2>
            <p className="mt-2 text-sm text-gray-600">
              Faça login na sua conta
            </p>
          </div>

          <Card>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                  label="Email"
                  type="email"
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'Email é obrigatório',
                    validate: (value) => validateEmail(value) || 'Email inválido',
                  })}
                  placeholder="seu@email.com"
                />

                <div className="relative">
                  <Input
                    label="Senha"
                    type={showPassword ? 'text' : 'password'}
                    leftIcon={<Lock className="h-4 w-4" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    }
                    error={errors.password?.message}
                    {...register('password', {
                      required: 'Senha é obrigatória',
                    })}
                    placeholder="Sua senha"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-[#42026F] hover:text-[#42026F]/80"
                  >
                    Esqueceu sua senha?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Entrar
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Não tem uma conta?
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link href="/register">
                    <Button variant="outline" className="w-full">
                      Criar conta
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
} 