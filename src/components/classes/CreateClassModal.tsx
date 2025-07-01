'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { BookOpen, FileText, Users } from 'lucide-react';
import { classesAPI } from '@/components/lib/api';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface CreateClassFormData {
  name: string;
  description: string;
  max_students: number;
}

export default function CreateClassModal({ isOpen, onClose, onSuccess }: CreateClassModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateClassFormData>();

  const onSubmit = async (data: CreateClassFormData) => {
    setIsLoading(true);
    try {
      const response = await classesAPI.create(data);
      
      if (response.success) {
        toast.success('Turma criada com sucesso!');
        reset();
        onClose();
        onSuccess?.();
      } else {
        toast.error(response.message || 'Erro ao criar turma');
      }
    } catch (error: any) {
      console.error('Erro ao criar turma:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar turma');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Criar Nova Turma"
      size="lg"
    >
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-[#42026F]/10 rounded-lg flex items-center justify-center mb-4">
            <BookOpen className="h-6 w-6 text-[#42026F]" />
          </div>
          <p className="text-gray-600">
            Preencha as informações para criar uma nova turma
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome da Turma"
            type="text"
            leftIcon={<BookOpen className="h-4 w-4" />}
            error={errors.name?.message}
            {...register('name', {
              required: 'Nome da turma é obrigatório',
              minLength: { value: 3, message: 'Nome deve ter pelo menos 3 caracteres' },
              maxLength: { value: 100, message: 'Nome deve ter no máximo 100 caracteres' },
            })}
            placeholder="Ex: Matemática Básica"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              {...register('description', {
                required: 'Descrição é obrigatória',
                minLength: { value: 10, message: 'Descrição deve ter pelo menos 10 caracteres' },
                maxLength: { value: 500, message: 'Descrição deve ter no máximo 500 caracteres' },
              })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#42026F] focus:border-transparent"
              placeholder="Descreva o conteúdo e objetivos da turma..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-error-600">{errors.description.message}</p>
            )}
          </div>

          <Input
            label="Número Máximo de Alunos"
            type="number"
            leftIcon={<Users className="h-4 w-4" />}
            error={errors.max_students?.message}
            {...register('max_students', {
              required: 'Número máximo de alunos é obrigatório',
              min: { value: 1, message: 'Mínimo 1 aluno' },
              max: { value: 100, message: 'Máximo 100 alunos' },
            })}
            placeholder="30"
            min="1"
            max="100"
            helperText="Defina o limite de alunos que podem se inscrever"
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
              Criar Turma
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
} 