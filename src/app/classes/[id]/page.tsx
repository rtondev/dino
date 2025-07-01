'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/components/lib/store';
import { classesAPI, activitiesAPI, Class, Activity } from '@/components/lib/api';
import { 
  ArrowLeft, Edit, Trash2, Users, Calendar, Code, RefreshCw, 
  Plus, BookOpen, UserPlus, UserMinus, Settings, AlertTriangle,
  Copy, CheckCircle, Clock, BarChart3, FileText, Info, Activity as ActivityIcon
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
  const [activeTab, setActiveTab] = useState('overview');

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
      const response = await activitiesAPI.create({
        ...createActivityData,
        class_id: Number(id)
      });
      
      if (response.success) {
        toast.success('Atividade criada com sucesso!');
        setShowCreateActivityModal(false);
        setCreateActivityData({
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
        loadClassDetails();
      } else {
        toast.error('Erro ao criar atividade');
      }
    } catch (error: any) {
      console.error('Erro ao criar atividade:', error);
      toast.error('Erro ao criar atividade');
    } finally {
      setCreatingActivity(false);
    }
  };

  const addQuestion = () => {
    setCreateActivityData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question_text: '',
          option_a: '',
          option_b: '',
          option_c: '',
          option_d: '',
          correct_answer: 'a'
        }
      ]
    }));
  };

  const removeQuestion = (index: number) => {
    setCreateActivityData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const updateQuestion = (index: number, field: string, value: string) => {
    setCreateActivityData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const updateActivityType = (type: 'quiz' | 'enquete' | 'questionario') => {
    setCreateActivityData(prev => ({
      ...prev,
      type,
      questions: type === 'enquete' ? [] : prev.questions
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Código copiado para a área de transferência!');
  };

  const handleCreateNoteForActivity = (activity: Activity) => {
    setSelectedActivityForNote(activity);
    setShowCreateNoteModal(true);
  };

  const handleNoteCreated = () => {
    setShowCreateNoteModal(false);
    setSelectedActivityForNote(null);
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
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
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
              <h1 className="text-3xl font-bold text-gray-900">{classDetails.name}</h1>
              <p className="text-gray-600 mt-1">{classDetails.description}</p>
            </div>
          </div>
          
          {canManage && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 border-gray-300 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            </div>
          )}
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Visão Geral
              </div>
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'students'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Alunos ({classDetails.students.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activities'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <ActivityIcon className="h-4 w-4" />
                Atividades ({classDetails.activities.length})
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Class Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Código de Acesso */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Code className="h-4 w-4 text-blue-600" />
                        <p className="text-xs font-semibold text-blue-700">Código de Acesso</p>
                      </div>
                      <div className="bg-white rounded-lg p-2 border border-blue-200 mb-2">
                        <p className="text-lg font-mono font-bold text-blue-900 text-center tracking-wider">
                          {classDetails.code}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(classDetails.code)}
                          className="flex-1 bg-white hover:bg-blue-50 border-blue-300 text-blue-700 text-xs py-1"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copiar
                        </Button>
                        {canManage && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleRegenerateCode}
                            className="bg-white hover:bg-blue-50 border-blue-300 text-blue-700 text-xs py-1 px-2"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alunos */}
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-green-600" />
                        <p className="text-xs font-semibold text-green-700">Alunos Inscritos</p>
                      </div>
                      <div className="mb-2">
                        <p className="text-2xl font-bold text-green-900">
                          {classDetails.student_count}
                        </p>
                        <p className="text-xs text-green-600">
                          de {classDetails.max_students} vagas
                        </p>
                      </div>
                      <div className="w-full bg-green-200 rounded-full h-1.5">
                        <div 
                          className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${(classDetails.student_count / classDetails.max_students) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Atividades */}
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-purple-600" />
                        <p className="text-xs font-semibold text-purple-700">Atividades</p>
                      </div>
                      <div className="mb-2">
                        <p className="text-2xl font-bold text-purple-900">
                          {classDetails.activities.length}
                        </p>
                        <p className="text-xs text-purple-600">
                          {classDetails.activities.length === 0 
                            ? 'Nenhuma atividade criada' 
                            : classDetails.activities.length === 1 
                              ? 'atividade criada' 
                              : 'atividades criadas'
                          }
                        </p>
                      </div>
                      {canManage && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowCreateActivityModal(true)}
                          className="w-full bg-white hover:bg-purple-50 border-purple-300 text-purple-700 text-xs py-1"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Criar Atividade
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data de Criação */}
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-orange-600" />
                        <p className="text-xs font-semibold text-orange-700">Criada em</p>
                      </div>
                      <div className="mb-2">
                        <p className="text-xl font-bold text-orange-900">
                          {new Date(classDetails.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-orange-600">
                          {new Date(classDetails.created_at).toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-xs text-orange-500">
                        Há {Math.floor((Date.now() - new Date(classDetails.created_at).getTime()) / (1000 * 60 * 60 * 24))} dias
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Professors Info */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Users className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Equipe de Professores</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Professor Principal */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{classDetails.professor_name}</p>
                        <p className="text-xs text-gray-600">Professor Principal</p>
                      </div>
                    </div>
                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full font-medium">
                      Principal
                    </span>
                  </div>
                  
                  {/* Professor Colaborador */}
                  {classDetails.collaborator_name ? (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{classDetails.collaborator_name}</p>
                          <p className="text-xs text-gray-600">Professor Colaborador</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                          Colaborador
                        </span>
                        {canManage && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleRemoveCollaborator}
                            className="text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50 text-xs py-1 px-2"
                          >
                            <UserMinus className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : canManage ? (
                    <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <UserPlus className="h-4 w-4 text-gray-600" />
                      </div>
                      <p className="text-gray-600 text-xs mb-2">Nenhum professor colaborador</p>
                      <Button
                        size="sm"
                        onClick={() => setShowCollaboratorModal(true)}
                        className="flex items-center gap-1 bg-gray-600 hover:bg-gray-700 text-xs py-1"
                      >
                        <UserPlus className="h-3 w-3" />
                        Adicionar
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Users className="h-4 w-4 text-gray-600" />
                      </div>
                      <p className="text-gray-600 text-xs">Nenhum professor colaborador</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Alunos Inscritos</h2>
              {classDetails.students.length > 6 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowStudentsModal(true)}
                >
                  Ver Todos
                </Button>
              )}
            </div>

            {classDetails.students.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum aluno inscrito ainda</h3>
                  <p className="text-gray-600">
                    Compartilhe o código de acesso para que os alunos possam se inscrever
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classDetails.students.slice(0, 6).map((student) => (
                  <Card key={student.id}>
                    <CardContent className="p-4">
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
                    </CardContent>
                  </Card>
                ))}
                {classDetails.students.length > 6 && (
                  <Card>
                    <CardContent className="p-4 text-center">
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
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Atividades da Turma</h2>
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

            {classDetails.activities.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma atividade criada</h3>
                  {canManage && (
                    <p className="text-gray-600">
                      Crie atividades para engajar seus alunos
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {classDetails.activities.slice(0, 5).map((activity) => (
                  <Card key={activity.id}>
                    <CardContent className="p-4">
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
                    </CardContent>
                  </Card>
                ))}
                {classDetails.activities.length > 5 && (
                  <div className="text-center pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        toast.success('Funcionalidade em desenvolvimento');
                      }}
                    >
                      Ver Todas as Atividades
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
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

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Excluir Turma"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Tem certeza que deseja excluir esta turma? Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleDeleteClass}
              loading={deleting}
              disabled={deleting}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Excluir Turma
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

      <Modal
        isOpen={showCollaboratorModal}
        onClose={() => setShowCollaboratorModal(false)}
        title="Adicionar Professor Colaborador"
      >
        <div className="space-y-4">
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

      <CreateNoteModal
        isOpen={showCreateNoteModal}
        onClose={() => setShowCreateNoteModal(false)}
        onSuccess={handleNoteCreated}
        activity={selectedActivityForNote}
      />
    </AppLayout>
  );
} 