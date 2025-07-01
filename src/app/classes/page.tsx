'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/components/lib/store';
import { classesAPI, Class } from '@/components/lib/api';
import { Plus, BookOpen, Users, Calendar, Code } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import JoinClassModal from '@/components/classes/JoinClassModal';
import CreateClassModal from '@/components/classes/CreateClassModal';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';

interface ClassWithDetails extends Class {
  professor_name: string;
  student_count: number;
  is_professor: boolean;
  is_collaborator: boolean;
}

export default function ClassesPage() {
  const { user } = useAuthStore();
  const [classes, setClasses] = useState<ClassWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const router = useRouter();

  const loadClasses = async () => {
    try {
      setLoading(true);
      const response = await classesAPI.getAll();
      
      if (response.success) {
        const classesWithDetails = response.data.map((cls: Class) => ({
          ...cls,
          professor_name: cls.professor_name || `Prof. ${cls.professor_id}`,
          student_count: 0, // TODO: Buscar contagem de alunos
          is_professor: user?.user_type === 'professor' && (cls.professor_id === user.id || cls.collaborator_id === user.id),
          is_collaborator: user?.user_type === 'professor' && cls.collaborator_id === user.id,
        }));
        
        setClasses(classesWithDetails);
      } else {
        toast.error('Erro ao carregar turmas');
      }
    } catch (error: any) {
      console.error('Erro ao carregar turmas:', error);
      toast.error('Erro ao carregar turmas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, [user]);

  const handleCreateClass = () => {
    setShowCreateModal(true);
  };

  const handleJoinClass = () => {
    setShowJoinModal(true);
  };

  const handleCreateSuccess = () => {
    loadClasses();
  };

  const handleJoinSuccess = () => {
    loadClasses();
  };

  if (loading) {
    return (
      <AuthGuard>
        <AppLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando turmas...</p>
            </div>
          </div>
        </AppLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <AppLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Turmas</h1>
              <p className="text-gray-600">
                {user?.user_type === 'professor' 
                  ? 'Gerencie suas turmas e acompanhe o progresso dos alunos'
                  : 'Explore turmas disponíveis e acompanhe suas inscrições'
                }
              </p>
            </div>
            
            <div className="flex gap-3">
              {user?.user_type === 'professor' ? (
                <Button onClick={handleCreateClass} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Criar Turma
                </Button>
              ) : (
                <Button onClick={handleJoinClass} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Entrar em Turma
                </Button>
              )}
            </div>
          </div>

          {/* Classes Grid */}
          {classes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma turma disponível
                </h3>
                <p className="text-gray-600">
                  {user?.user_type === 'professor'
                    ? 'Crie sua primeira turma para começar'
                    : 'Entre em uma turma para começar a aprender'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((cls) => (
                <Card key={cls.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{cls.name}</CardTitle>
                        <p className="text-sm text-gray-600 mb-3">{cls.description}</p>
                      </div>
                      {cls.is_professor && (
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          cls.is_collaborator 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-primary-100 text-primary-700'
                        }`}>
                          {cls.is_collaborator ? 'Colaborador' : 'Professor'}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Código:</span>
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-800">
                          {cls.code}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Professor:</span>
                        <span className="font-medium">{cls.professor_name}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Alunos:</span>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{cls.student_count}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Criada em:</span>
                        <span>{new Date(cls.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={() => {
                          if (cls.is_professor) {
                            router.push(`/classes/${cls.id}`);
                          } else {
                            // Se não for professor, pode mostrar detalhes simples ou nada
                          }
                        }}
                      >
                        {cls.is_professor ? (cls.is_collaborator ? 'Gerenciar Turma' : 'Gerenciar Turma') : 'Ver Detalhes'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Modals */}
        <JoinClassModal
          isOpen={showJoinModal}
          onClose={() => setShowJoinModal(false)}
          onSuccess={handleJoinSuccess}
        />
        
        <CreateClassModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      </AppLayout>
    </AuthGuard>
  );
} 