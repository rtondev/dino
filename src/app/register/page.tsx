'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import PasswordChecklist from '@/components/PasswordChecklist';
import Step1UserEmail from './Step1UserEmail';
import Step2Password from './Step2Password';
import Step3Profile from './Step3Profile';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  user_type: 'aluno' | 'professor' | 'admin';
  age: number;
  institution: string;
  privacy_policy_accepted: boolean;
}

const steps = [
  'Dados de acesso',
  'Senha',
  'Perfil',
];

function ProgressBar({ step }: { step: number }) {
  const percent = Math.round(((step + 1) / steps.length) * 100);
  return (
    <div className="w-full h-6 flex items-center bg-gray-200 relative mb-8" style={{height:24}}>
      <div
        className="bg-[#42026F] h-full transition-all duration-300"
        style={{ width: `${percent}%` }}
      />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-bold text-sm drop-shadow">
        {percent}%
      </span>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStep = Number(searchParams.get('step')) || 0;
  const [step, setStep] = useState(initialStep);
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    user_type: undefined as any,
    age: undefined as any,
    institution: '',
    privacy_policy_accepted: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const [errors, setErrors] = useState<any>({});

  // Validação por etapa
  function validateStep(currentStep = step) {
    const newErrors: any = {};
    if (currentStep === 0) {
      if (!formData.username || formData.username.length < 4) newErrors.username = 'Mínimo 4 caracteres';
      if (!validateUsername(formData.username)) newErrors.username = 'Apenas letras, números e underscore';
      if (!formData.email) newErrors.email = 'Email obrigatório';
      if (!validateEmail(formData.email)) newErrors.email = 'Email inválido';
    }
    if (currentStep === 1) {
      if (!formData.password) newErrors.password = 'Senha obrigatória';
      if (!validatePassword(formData.password)) newErrors.password = 'Senha não atende aos requisitos';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Senhas não coincidem';
    }
    if (currentStep === 2) {
      if (!formData.user_type) newErrors.user_type = 'Tipo obrigatório';
      if (!formData.age || formData.age < 1 || formData.age > 120) newErrors.age = 'Idade inválida';
      if (!formData.institution || formData.institution.length < 2) newErrors.institution = 'Instituição obrigatória';
      if (!formData.privacy_policy_accepted) newErrors.privacy_policy_accepted = 'Aceite obrigatório';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Handlers
  function handleNext() {
    if (validateStep()) {
      const nextStep = step + 1;
      setStep(nextStep);
      router.replace(`?step=${nextStep}`);
    }
  }
  function handleBack() {
    const prevStep = step - 1;
    setStep(prevStep);
    router.replace(`?step=${prevStep}`);
  }
  function handleChange(e: any) {
    const { name, value, type, checked } = e.target;
    let newValue = value;
    if (name === 'username') {
      newValue = value.replace(/\s/g, '_');
    }
    setFormData(f => ({ ...f, [name]: type === 'checkbox' ? checked : newValue }));
  }
  async function handleSubmit(e: any) {
    e.preventDefault();
    if (!validateStep(2)) return;
    setIsLoading(true);
    try {
      const response = await authAPI.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        user_type: formData.user_type,
        age: Number(formData.age),
        institution: formData.institution,
        privacy_policy_accepted: formData.privacy_policy_accepted,
      });
      if (response.success) {
        login(response.data.user, response.data.tokens.token);
        toast.success('Conta criada com sucesso!');
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error('Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  }

  // Sincronizar step com query string ao navegar manualmente
  useEffect(() => {
    const urlStep = Number(searchParams.get('step'));
    if (!isNaN(urlStep) && urlStep !== step) {
      setStep(urlStep);
    }
  }, [searchParams, step]);

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="fixed top-0 left-0 w-full z-50">
          <ProgressBar step={step} />
        </div>
        <div className="max-w-md w-full space-y-8 pt-20"> {/* pt-20 para não cobrir o conteúdo */}
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Logo, título e subtítulo no topo */}
          <div className="text-center">
                  <div className="mx-auto h-12 w-12 flex items-center justify-center">
              <img src="/logo.svg" alt="Dino Logo" className="h-8 w-8" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Dino App</h2>
            <p className="mt-2 text-sm text-gray-600">
                    {step === 0 && 'Crie sua conta'}
                    {step === 1 && 'Defina uma senha segura'}
                    {step === 2 && 'Complete seu perfil'}
                  </p>
                </div>
                {step === 0 && (
                  <Step1UserEmail formData={formData} errors={errors} onChange={handleChange} />
                )}
                {step === 1 && (
                  <Step2Password
                    formData={formData}
                    errors={errors}
                    onChange={handleChange}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    showConfirmPassword={showConfirmPassword}
                    setShowConfirmPassword={setShowConfirmPassword}
                  />
                )}
                {step === 2 && (
                  <Step3Profile formData={formData} errors={errors} onChange={handleChange} />
                )}
                <div className="flex justify-between mt-8">
                  {step > 0 && (
                    <Button type="button" variant="outline" onClick={handleBack}>
                      Voltar
                    </Button>
                  )}
                  {step < 2 && (
                    <Button type="button" onClick={handleNext}>
                      Próximo
                    </Button>
                  )}
                  {step === 2 && (
                    <Button type="submit" loading={isLoading}>
                      Cadastrar
                    </Button>
                  )}
                </div>
                {step === 0 && (
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
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
} 