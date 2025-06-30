'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/components/lib/store';
import { classesAPI, activitiesAPI, Class, Activity } from '@/components/lib/api';
import { 
  ArrowLeft, Edit, Trash2, Users, Calendar, Code, RefreshCw, 
  Plus, BookOpen, UserPlus, UserMinus, Settings, AlertTriangle,
  Copy, CheckCircle, Clock, BarChart3, FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import CreateNoteModal from '@/components/notes/CreateNoteModal';

interface ClassDetails extends Class {
  professor_name: string;
  collaborator_name?: string;
  students: Array<{
    id: number;
    name: string;
    email: string;
    institution: string;
    joined_at: string;
  }>;
  activities: Activity[];
  student_count: number;
  is_professor: boolean;
  is_collaborator: boolean;
}

interface EditClassData {
  name: string;
  description: string;
  max_students: number;
}

interface CreateActivityData {
  title: string;
  description: string;
  type: 'quiz' | 'enquete' | 'questionario';
  time_limit: number;
  due_date: string;
  questions: Array<{
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer?: 'a' | 'b' | 'c' | 'd';
  }>;
}

export default function ClassDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [showCreateActivityModal, setShowCreateActivityModal] = useState(false);
  const [showCreateNoteModal, setShowCreateNoteModal] = useState(false);
  const [selectedActivityForNote, setSelectedActivityForNote] = useState<Activity | null>(null);
  const [editData, setEditData] = useState<EditClassData>({
    name: '',
    description: '',
    max_students: 50
  });
  const [createActivityData, setCreateActivityData] = useState<CreateActivityData>({
    title: '',
    description: '',
    type: 'quiz',
    time_limit: 30,
    due_date: '',
    questions: [
      {
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'a'
      }
    ]
  });
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [creatingActivity, setCreatingActivity] = useState(false);

  const loadClassDetails = async () => {
    try {
      setLoading(true);
      const [classResponse, studentsResponse, activitiesResponse] = await Promise.all([
        classesAPI.getById(Number(id)),
        classesAPI.getStudents(Number(id)),
        activitiesAPI.getByClass(Number(id))
      ]);

      if (classResponse.success && studentsResponse.success && activitiesResponse.success) {
        const classData = classResponse.data;
        const students = studentsResponse.data;
        const activities = activitiesResponse.data;

        setClassDetails({
          ...classData,
          students,
          activities,
          student_count: students.length,
          is_professor: user?.user_type === 'professor' && classData.professor_id === user.id,
          is_collaborator: user?.user_type === 'professor' && classData.collaborator_id === user.id,
          professor_name: classData.professor_name || `Prof. ${classData.professor_id}`,
          collaborator_name: classData.collaborator_name || (classData.collaborator_id ? `Prof. ${classData.collaborator_id}` : undefined)
        });

        console.log('Frontend - Class Details:', {
          user_id: user?.id,
          user_type: user?.user_type,
          professor_id: classData.professor_id,
          collaborator_id: classData.collaborator_id,
          is_professor: user?.user_type === 'professor' && classData.professor_id === user.id,
          is_collaborator: user?.user_type === 'professor' && classData.collaborator_id === user.id
        });

        setEditData({
          name: classData.name,
          description: classData.description,
          max_students: classData.max_students
        });
      } else {
        toast.error('Erro ao carregar detalhes da turma');
        router.push('/classes');
      }
    } catch (error: any) {
      console.error('Erro ao carregar detalhes da turma:', error);
      toast.error('Erro ao carregar detalhes da turma');
      router.push('/classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadClassDetails();
    }
  }, [id, user]);

  const handleEditClass = async () => {
    try {
      setUpdating(true);
      const response = await classesAPI.update(Number(id), editData);
      
      if (response.success) {
        toast.success('Turma atualizada com sucesso!');
        setShowEditModal(false);
        loadClassDetails();
      } else {
        toast.error('Erro ao atualizar turma');
      }
    } catch (error: any) {
      console.error('Erro ao atualizar turma:', error);
      toast.error('Erro ao atualizar turma');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteClass = async () => {
    try {
      setDeleting(true);
      const response = await classesAPI.delete(Number(id));
      
      if (response.success) {
        toast.success('Turma excluída com sucesso!');
        router.push('/classes');
      } else {
        toast.error('Erro ao excluir turma');
      }
    } catch (error: any) {
      console.error('Erro ao excluir turma:', error);
      toast.error('Erro ao excluir turma');
    } finally {
      setDeleting(false);
    }
  };

  const handleRegenerateCode = async () => {
    try {
      const response = await classesAPI.regenerateCode(Number(id));
      
      if (response.success) {
        toast.success('Código regenerado com sucesso!');
        loadClassDetails();
      } else {
        toast.error('Erro ao regenerar código');
      }
    } catch (error: any) {
      console.error('Erro ao regenerar código:', error);
      toast.error('Erro ao regenerar código');
    }
  };

  const handleAddCollaborator = async () => {
    try {
      const response = await classesAPI.addCollaborator(Number(id), { collaborator_email: collaboratorEmail });
      
      if (response.success) {
        toast.success('Professor colaborador adicionado com sucesso!');
        setShowCollaboratorModal(false);
        setCollaboratorEmail('');
        loadClassDetails();
      } else {
        toast.error('Erro ao adicionar colaborador');
      }
    } catch (error: any) {
      console.error('Erro ao adicionar colaborador:', error);
      toast.error('Erro ao adicionar colaborador');
    }
  };

  const handleRemoveCollaborator = async () => {
    if (!classDetails?.collaborator_id) return;
    
    try {
      const response = await classesAPI.removeCollaborator(Number(id), { collaborator_id: classDetails.collaborator_id });
      
      if (response.success) {
        toast.success('Professor colaborador removido com sucesso!');
        loadClassDetails();
      } else {
        toast.error('Erro ao remover colaborador');
      }
    } catch (error: any) {
      console.error('Erro ao remover colaborador:', error);
      toast.error('Erro ao remover colaborador');
    }
  };

  const handleCreateActivity = async () => {
    try {
      setCreatingActivity(true);
      
      console.log('Frontend - User:', user);
      console.log('Frontend - User Type:', user?.user_type);
      console.log('Frontend - Class ID:', id);
      
      // Validar dados
      if (!createActivityData.title.trim() || !createActivityData.description.trim()) {
        toast.error('Preencha título e descrição da atividade');
        return;
      }

      if (createActivityData.questions.length < 5) {
        toast.error('A atividade deve ter pelo menos 5 questões');
        return;
      }

      // Validar questões
      for (let i = 0; i < createActivityData.questions.length; i++) {
        const question = createActivityData.questions[i];
        if (!question.question_text.trim() || 
            !question.option_a.trim() || 
            !question.option_b.trim() || 
            !question.option_c.trim() || 
            !question.option_d.trim()) {
          toast.error(`Questão ${i + 1} está incompleta`);
          return;
        }

        // Para quiz e questionário, validar resposta correta
        if (createActivityData.type !== 'enquete' && !question.correct_answer) {
          toast.error(`Questão ${i + 1} deve ter uma resposta correta`);
          return;
        }
      }

      // Preparar questões para envio
      const questionsToSend = createActivityData.questions.map(question => {
        const questionData = {
          question_text: question.question_text,
          option_a: question.option_a,
          option_b: question.option_b,
          option_c: question.option_c,
          option_d: question.option_d
        };

        // Só incluir correct_answer se não for enquete
        if (createActivityData.type !== 'enquete') {
          questionData.correct_answer = question.correct_answer;
        }

        return questionData;
      });

      const response = await activitiesAPI.create({
        class_id: Number(id),
        title: createActivityData.title,
        description: createActivityData.description,
        type: createActivityData.type,
        time_limit: createActivityData.time_limit * 60, // Converter para segundos
        due_date: createActivityData.due_date || null,
        questions: questionsToSend
      });

      if (response.success) {
        toast.success('Atividade criada com sucesso!');
        setShowCreateActivityModal(false);
        // Resetar formulário
        const resetQuestion = {
          question_text: '',
          option_a: '',
          option_b: '',
          option_c: '',
          option_d: ''
        };

        // Só adicionar correct_answer se não for enquete
        if (createActivityData.type !== 'enquete') {
          resetQuestion.correct_answer = 'a';
        }

        setCreateActivityData({
          title: '',
          description: '',
          type: 'quiz',
          time_limit: 30,
          due_date: '',
          questions: [resetQuestion]
        });
        loadClassDetails();
      } else {
        toast.error(response.message || 'Erro ao criar atividade');
      }
    } catch (error: any) {
      console.error('Erro ao criar atividade:', error);
      toast.error('Erro ao criar atividade');
    } finally {
      setCreatingActivity(false);
    }
  };

  const addQuestion = () => {
    const newQuestion = {
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: ''
    };

    // Só adicionar correct_answer se não for enquete
    if (createActivityData.type !== 'enquete') {
      newQuestion.correct_answer = 'a';
    }

    setCreateActivityData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const removeQuestion = (index: number) => {
    if (createActivityData.questions.length <= 1) {
      toast.error('A atividade deve ter pelo menos uma questão');
      return;
    }
    
    setCreateActivityData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const updateQuestion = (index: number, field: string, value: string) => {
    setCreateActivityData(prev => ({
      ...prev,
      questions: prev.questions.map((question, i) => 
        i === index ? { ...question, [field]: value } : question
      )
    }));
  };

  const updateActivityType = (type: 'quiz' | 'enquete' | 'questionario') => {
    setCreateActivityData(prev => {
      const newQuestions = prev.questions.map(question => {
        if (type === 'enquete') {
          // Para enquete, remover correct_answer
          const { correct_answer, ...questionWithoutCorrect } = question;
          return questionWithoutCorrect;
        } else {
          // Para quiz/questionário, adicionar correct_answer se não existir
          return {
            ...question,
            correct_answer: question.correct_answer || 'a'
          };
        }
      });

      return {
        ...prev,
        type,
        questions: newQuestions
      };
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Código copiado!');
  };

  const handleCreateNoteForActivity = (activity: Activity) => {
    setSelectedActivityForNote(activity);
    setShowCreateNoteModal(true);
  };

  const handleNoteCreated = () => {
    // Recarregar dados se necessário
    loadClassDetails();
  };

  const canManage = classDetails?.is_professor || classDetails?.is_collaborator;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando detalhes da turma...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!classDetails) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Turma não encontrada</h2>
          <Button onClick={() => router.push('/classes')} className="mt-4">
            Voltar para Turmas
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/classes')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{classDetails.name}</h1>
              <p className="text-gray-600">{classDetails.description}</p>
            </div>
          </div>
          
          {canManage && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            </div>
          )}
        </div>

        {/* Class Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Código de Acesso</p>
                  <p className="text-2xl font-bold text-gray-900">{classDetails.code}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(classDetails.code)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  {canManage && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRegenerateCode}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Alunos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {classDetails.student_count}/{classDetails.max_students}
                  </p>
                </div>
                <Users className="h-8 w-8 text-primary-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Atividades</p>
                  <p className="text-2xl font-bold text-gray-900">{classDetails.activities.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-primary-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Criada em</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(classDetails.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-primary-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Professors Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Professores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{classDetails.professor_name}</p>
                  <p className="text-sm text-gray-600">Professor Principal</p>
                </div>
                <span className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full">
                  Principal
                </span>
              </div>
              
              {classDetails.collaborator_name ? (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{classDetails.collaborator_name}</p>
                    <p className="text-sm text-gray-600">Professor Colaborador</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                      Colaborador
                    </span>
                    {canManage && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRemoveCollaborator}
                        className="text-red-600 hover:text-red-700"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ) : canManage ? (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-2">Nenhum professor colaborador</p>
                  <Button
                    size="sm"
                    onClick={() => setShowCollaboratorModal(true)}
                    className="flex items-center gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Adicionar Colaborador
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600">Nenhum professor colaborador</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Alunos ({classDetails.students.length})
              </CardTitle>
              <Button
                variant="outline"
                onClick={() => setShowStudentsModal(true)}
              >
                Ver Todos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {classDetails.students.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum aluno inscrito ainda</p>
                <p className="text-sm text-gray-500 mt-1">
                  Compartilhe o código de acesso para que os alunos possam se inscrever
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classDetails.students.slice(0, 6).map((student) => (
                  <div key={student.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.email}</p>
                        <p className="text-xs text-gray-500">{student.institution}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          Desde {new Date(student.joined_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {classDetails.students.length > 6 && (
                  <div className="p-4 border rounded-lg text-center">
                    <p className="text-sm text-gray-600">
                      +{classDetails.students.length - 6} alunos
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowStudentsModal(true)}
                      className="mt-2"
                    >
                      Ver Todos
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activities List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Atividades ({classDetails.activities.length})
              </CardTitle>
              {canManage && (
                <Button
                  onClick={() => setShowCreateActivityModal(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Criar Atividade
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {classDetails.activities.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma atividade criada</p>
                {canManage && (
                  <p className="text-sm text-gray-500 mt-1">
                    Crie atividades para engajar seus alunos
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {classDetails.activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{activity.title}</h3>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {activity.time_limit} min
                          </span>
                          <span className="flex items-center gap-1">
                            <BarChart3 className="h-3 w-3" />
                            {activity.passing_score}% aprovação
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // TODO: Implementar modal de detalhes da atividade
                            toast.success('Funcionalidade em desenvolvimento');
                          }}
                        >
                          Ver Detalhes
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCreateNoteForActivity(activity)}
                          className="flex items-center gap-1"
                        >
                          <FileText className="h-3 w-3" />
                          Criar Nota
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {classDetails.activities.length > 5 && (
                  <div className="text-center pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        // TODO: Implementar modal com todas as atividades
                        toast.success('Funcionalidade em desenvolvimento');
                      }}
                    >
                      Ver Todas as Atividades
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Class Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Turma"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Turma
            </label>
            <Input
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              placeholder="Nome da turma"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Descrição da turma"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número Máximo de Alunos
            </label>
            <Input
              type="number"
              value={editData.max_students}
              onChange={(e) => setEditData({ ...editData, max_students: Number(e.target.value) })}
              min="1"
              max="50"
              placeholder="50"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleEditClass}
              loading={updating}
              disabled={updating}
              className="flex-1"
            >
              Salvar Alterações
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
              disabled={updating}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Class Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Excluir Turma"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-800">Atenção!</p>
              <p className="text-sm text-red-700">
                Você está prestes a excluir uma turma, tem certeza que quer continuar?
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Esta ação irá:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Excluir permanentemente a turma "{classDetails.name}"</li>
              <li>• Remover todos os alunos da turma</li>
              <li>• Excluir todas as atividades e tentativas</li>
              <li>• Excluir todo o progresso relacionado</li>
            </ul>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleDeleteClass}
              loading={deleting}
              disabled={deleting}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Sim, Excluir Turma
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Collaborator Modal */}
      <Modal
        isOpen={showCollaboratorModal}
        onClose={() => setShowCollaboratorModal(false)}
        title="Adicionar Professor Colaborador"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Digite o email do professor que você deseja adicionar como colaborador.
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email do Professor
            </label>
            <Input
              type="email"
              value={collaboratorEmail}
              onChange={(e) => setCollaboratorEmail(e.target.value)}
              placeholder="professor@exemplo.com"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleAddCollaborator}
              disabled={!collaboratorEmail}
              className="flex-1"
            >
              Adicionar Colaborador
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCollaboratorModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Students Modal */}
      <Modal
        isOpen={showStudentsModal}
        onClose={() => setShowStudentsModal(false)}
        title={`Alunos - ${classDetails.name}`}
        size="lg"
      >
        <div className="space-y-4">
          {classDetails.students.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum aluno inscrito</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {classDetails.students.map((student) => (
                <div key={student.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{student.name}</h4>
                      <p className="text-sm text-gray-600">{student.email}</p>
                      <p className="text-xs text-gray-500">{student.institution}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        Inscrito em {new Date(student.joined_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowStudentsModal(false)}
              className="w-full"
            >
              Fechar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Activity Modal */}
      <Modal
        isOpen={showCreateActivityModal}
        onClose={() => setShowCreateActivityModal(false)}
        title="Criar Nova Atividade"
        size="xl"
      >
        <div className="space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Informações básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Informações da Atividade</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <Input
                value={createActivityData.title}
                onChange={(e) => setCreateActivityData({ ...createActivityData, title: e.target.value })}
                placeholder="Digite o título da atividade"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição *
              </label>
              <textarea
                value={createActivityData.description}
                onChange={(e) => setCreateActivityData({ ...createActivityData, description: e.target.value })}
                placeholder="Descreva a atividade..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <select
                  value={createActivityData.type}
                  onChange={(e) => updateActivityType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="quiz">Quiz</option>
                  <option value="enquete">Enquete</option>
                  <option value="questionario">Questionário</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tempo Limite (minutos)
                </label>
                <Input
                  type="number"
                  value={createActivityData.time_limit}
                  onChange={(e) => setCreateActivityData({ ...createActivityData, time_limit: Number(e.target.value) })}
                  min="5"
                  max="120"
                  placeholder="30"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Entrega
                </label>
                <Input
                  type="datetime-local"
                  value={createActivityData.due_date}
                  onChange={(e) => setCreateActivityData({ ...createActivityData, due_date: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Questões */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Questões ({createActivityData.questions.length})
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addQuestion}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar Questão
              </Button>
            </div>
            
            <div className="space-y-6">
              {createActivityData.questions.map((question, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Questão {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeQuestion(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pergunta *
                      </label>
                      <textarea
                        value={question.question_text}
                        onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                        placeholder="Digite a pergunta..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        rows={2}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {createActivityData.type === 'enquete' ? 'Opção 1' : 'Opção A'} *
                        </label>
                        <Input
                          value={question.option_a}
                          onChange={(e) => updateQuestion(index, 'option_a', e.target.value)}
                          placeholder={createActivityData.type === 'enquete' ? 'Primeira opção' : 'Primeira opção'}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {createActivityData.type === 'enquete' ? 'Opção 2' : 'Opção B'} *
                        </label>
                        <Input
                          value={question.option_b}
                          onChange={(e) => updateQuestion(index, 'option_b', e.target.value)}
                          placeholder={createActivityData.type === 'enquete' ? 'Segunda opção' : 'Segunda opção'}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {createActivityData.type === 'enquete' ? 'Opção 3' : 'Opção C'} *
                        </label>
                        <Input
                          value={question.option_c}
                          onChange={(e) => updateQuestion(index, 'option_c', e.target.value)}
                          placeholder={createActivityData.type === 'enquete' ? 'Terceira opção' : 'Terceira opção'}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {createActivityData.type === 'enquete' ? 'Opção 4' : 'Opção D'} *
                        </label>
                        <Input
                          value={question.option_d}
                          onChange={(e) => updateQuestion(index, 'option_d', e.target.value)}
                          placeholder={createActivityData.type === 'enquete' ? 'Quarta opção' : 'Quarta opção'}
                        />
                      </div>
                    </div>
                    
                    {createActivityData.type !== 'enquete' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Resposta Correta *
                        </label>
                        <select
                          value={question.correct_answer}
                          onChange={(e) => updateQuestion(index, 'correct_answer', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="a">A</option>
                          <option value="b">B</option>
                          <option value="c">C</option>
                          <option value="d">D</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleCreateActivity}
              loading={creatingActivity}
              disabled={creatingActivity}
              className="flex-1"
            >
              Criar Atividade
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCreateActivityModal(false)}
              disabled={creatingActivity}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Note Modal */}
      <CreateNoteModal
        isOpen={showCreateNoteModal}
        onClose={() => {
          setShowCreateNoteModal(false);
          setSelectedActivityForNote(null);
        }}
        onSuccess={handleNoteCreated}
        presetContentType="activity"
        presetContentId={selectedActivityForNote?.id}
      />
    </AppLayout>
  );
} 