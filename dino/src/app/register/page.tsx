'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, User, Calendar, Building, BookOpen, CheckCircle } from 'lucide-react';
import { authAPI } from '@/components/lib/api';
import { useAuthStore } from '@/components/lib/store';
import { validateEmail, validatePassword, validateUsername } from '@/components/lib/utils';
import AuthGuard from '@/components/auth/AuthGuard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  user_type: 'aluno' | 'professor';
  age: number;
  institution: string;
  privacy_policy_accepted: boolean;
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    // Validações
    if (!validateEmail(data.email)) {
      toast.error('Email inválido');
      return;
    }

    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      toast.error('Senha não atende aos requisitos');
      return;
    }

    const usernameValidation = validateUsername(data.username);
    if (!usernameValidation.isValid) {
      toast.error('Nome de usuário inválido');
      return;
    }

    if (data.password !== data.confirmPassword) {
      toast.error('Senhas não coincidem');
      return;
    }

    if (!data.privacy_policy_accepted) {
      toast.error('Você deve aceitar a política de privacidade');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Tentando registrar usuário:', { 
        username: data.username, 
        email: data.email, 
        user_type: data.user_type,
        age: data.age,
        institution: data.institution
      });
      
      const response = await authAPI.register({
        username: data.username,
        email: data.email,
        password: data.password,
        user_type: data.user_type,
        age: data.age,
        institution: data.institution,
        privacy_policy_accepted: data.privacy_policy_accepted,
      });
      
      if (response.success) {
        login(response.data.user, response.data.tokens.token);
        toast.success('Conta criada com sucesso!');
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Erro no registro:', error);
      
      // Tratamento específico para diferentes tipos de erro
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 400:
            if (data.errors && Array.isArray(data.errors)) {
              // Mostrar todos os erros de validação
              data.errors.forEach((err: string) => toast.error(err));
            } else {
              toast.error(data.message || 'Dados inválidos');
            }
            break;
          case 409:
            toast.error('Email ou nome de usuário já existe');
            break;
          case 429:
            toast.error('Muitas tentativas. Tente novamente em alguns minutos');
            break;
          case 500:
            toast.error('Erro no servidor. Tente novamente mais tarde');
            break;
          default:
            toast.error(data.message || 'Erro ao criar conta');
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
              <img src="/logo.svg" alt="Dino Logo" className="h-8 w-8" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Dino App</h2>
            <p className="mt-2 text-sm text-gray-600">
              Crie sua conta
            </p>
          </div>

          <Card>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                  label="Nome de usuário"
                  type="text"
                  leftIcon={<User className="h-4 w-4" />}
                  error={errors.username?.message}
                  {...register('username', {
                    required: 'Nome de usuário é obrigatório',
                    minLength: { value: 4, message: 'Mínimo 4 caracteres' },
                    maxLength: { value: 50, message: 'Máximo 50 caracteres' },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message: 'Apenas letras, números e underscore',
                    },
                  })}
                  placeholder="seu_usuario"
                  helperText="4-50 caracteres, apenas letras, números e underscore"
                />

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
                      minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                      maxLength: { value: 12, message: 'Máximo 12 caracteres' },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])/,
                        message: 'Deve conter minúscula, maiúscula e caractere especial',
                      },
                    })}
                    placeholder="Sua senha"
                    helperText="6-12 caracteres, com minúscula, maiúscula e caractere especial"
                  />
                </div>

                <div className="relative">
                  <Input
                    label="Confirmar senha"
                    type={showConfirmPassword ? 'text' : 'password'}
                    leftIcon={<Lock className="h-4 w-4" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    }
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword', {
                      required: 'Confirmação de senha é obrigatória',
                      validate: (value) => value === password || 'Senhas não coincidem',
                    })}
                    placeholder="Confirme sua senha"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de usuário
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        value="aluno"
                        {...register('user_type', { required: 'Tipo de usuário é obrigatório' })}
                        className="mr-2"
                      />
                      <span className="text-sm">Aluno</span>
                    </label>
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        value="professor"
                        {...register('user_type', { required: 'Tipo de usuário é obrigatório' })}
                        className="mr-2"
                      />
                      <span className="text-sm">Professor</span>
                    </label>
                  </div>
                  {errors.user_type && (
                    <p className="mt-1 text-sm text-error-600">{errors.user_type.message}</p>
                  )}
                </div>

                <Input
                  label="Idade"
                  type="number"
                  leftIcon={<Calendar className="h-4 w-4" />}
                  error={errors.age?.message}
                  {...register('age', {
                    required: 'Idade é obrigatória',
                    min: { value: 1, message: 'Idade deve ser maior que 0' },
                    max: { value: 120, message: 'Idade deve ser menor que 120' },
                  })}
                  placeholder="25"
                  min="1"
                  max="120"
                />

                <Input
                  label="Instituição"
                  type="text"
                  leftIcon={<Building className="h-4 w-4" />}
                  error={errors.institution?.message}
                  {...register('institution', {
                    required: 'Instituição é obrigatória',
                    minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                    maxLength: { value: 100, message: 'Máximo 100 caracteres' },
                  })}
                  placeholder="Universidade Federal"
                />

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      {...register('privacy_policy_accepted', {
                        required: 'Você deve aceitar a política de privacidade',
                      })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label className="text-gray-700">
                      Eu aceito a{' '}
                      <Link
                        href="/privacy-policy"
                        className="text-primary-600 hover:text-primary-500"
                        target="_blank"
                      >
                        política de privacidade
                      </Link>
                    </label>
                    {errors.privacy_policy_accepted && (
                      <p className="mt-1 text-sm text-error-600">
                        {errors.privacy_policy_accepted.message}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Criar conta
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Já tem uma conta?
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link href="/login">
                    <Button variant="outline" className="w-full">
                      Fazer login
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