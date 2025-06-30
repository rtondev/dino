'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Code, BookOpen } from 'lucide-react';
import { classesAPI } from '@/components/lib/api';
import BaseModal from '@/components/ui/modals/BaseModal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface JoinClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface JoinClassFormData {
  code: string;
}

export default function JoinClassModal({ isOpen, onClose, onSuccess }: JoinClassModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<JoinClassFormData>();

  const onSubmit = async (data: JoinClassFormData) => {
    setIsLoading(true);
    try {
      const response = await classesAPI.join(data);
      
      if (response.success) {
        toast.success('Entrou na turma com sucesso!');
        reset();
        onClose();
        onSuccess?.();
      } else {
        toast.error(response.message || 'Erro ao entrar na turma');
      }
    } catch (error: any) {
      console.error('Erro ao entrar na turma:', error);
      toast.error(error.response?.data?.message || 'Erro ao entrar na turma');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Entrar em Turma"
      size="md"
    >
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-[#42026F]/10 rounded-lg flex items-center justify-center mb-4">
            <BookOpen className="h-6 w-6 text-[#42026F]" />
          </div>
          <p className="text-gray-600">
            Digite o código da turma para entrar
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Código da Turma"
            type="text"
            leftIcon={<Code className="h-4 w-4" />}
            error={errors.code?.message}
            {...register('code', {
              required: 'Código da turma é obrigatório',
              minLength: { value: 3, message: 'Código deve ter pelo menos 3 caracteres' },
              maxLength: { value: 20, message: 'Código deve ter no máximo 20 caracteres' },
            })}
            placeholder="Ex: MATH101"
            helperText="Digite o código fornecido pelo professor"
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              loading={isLoading}
              disabled={isLoading}
            >
              Entrar na Turma
            </Button>
          </div>
        </form>
      </div>
    </BaseModal>
  );
} 