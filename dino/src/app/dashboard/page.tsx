'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  BookOpen,
  Activity,
  Users,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';
import { useAuthStore } from '@/components/lib/store';
import { classesAPI, activitiesAPI, contentAPI } from '@/components/lib/api';
import AppLayout from '@/components/layout/AppLayout';
import AuthGuard from '@/components/auth/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { api } from '@/components/lib/api';

interface DashboardStats {
  totalClasses: number;
  totalActivities: number;
  totalContent: number;
  completedActivities: number;
  pendingActivities: number;
  progressPercentage: number;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalClasses: 0,
    totalActivities: 0,
    totalContent: 0,
    completedActivities: 0,
    pendingActivities: 0,
    progressPercentage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Carregar dados baseado no tipo de usuário
      if (user?.user_type === 'professor') {
        const [classesResponse, activitiesResponse] = await Promise.all([
          classesAPI.getAll(),
          activitiesAPI.getAll(),
        ]);

        setStats({
          totalClasses: classesResponse.data?.length || 0,
          totalActivities: activitiesResponse.data?.length || 0,
          totalContent: 0, // Implementar quando necessário
          completedActivities: 0,
          pendingActivities: 0,
          progressPercentage: 0,
        });
      } else {
        // Para alunos
        const [classesResponse, activitiesResponse, contentResponse] = await Promise.all([
          classesAPI.getAll(),
          api.get('/app/activities', {
            headers: typeof window !== 'undefined' && localStorage.getItem('token')
              ? { Authorization: `Bearer ${localStorage.getItem('token')}` }
              : {},
          }),
          contentAPI.getStats(),
        ]);

        setStats({
          totalClasses: classesResponse.data?.length || 0,
          totalActivities: activitiesResponse.data?.length || 0,
          totalContent: contentResponse.data?.total || 0,
          completedActivities: contentResponse.data?.completed || 0,
          pendingActivities: contentResponse.data?.pending || 0,
          progressPercentage: contentResponse.data?.progress_percentage || 0,
        });
      }
    } catch (error: any) {
      toast.error('Erro ao carregar dados do dashboard');
      console.error('Dashboard error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AuthGuard>
      <AppLayout>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando dashboard...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">
                Bem-vindo de volta, {user?.username}! Aqui está um resumo da sua atividade.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Turmas"
                value={stats.totalClasses}
                icon={<GraduationCap className="h-6 w-6 text-white" />}
                color="bg-blue-500"
                subtitle={user?.user_type === 'professor' ? 'Criadas' : 'Participando'}
              />
              
              <StatCard
                title="Atividades"
                value={stats.totalActivities}
                icon={<Activity className="h-6 w-6 text-white" />}
                color="bg-green-500"
                subtitle={user?.user_type === 'professor' ? 'Criadas' : 'Disponíveis'}
              />
              
              {user?.user_type === 'aluno' && (
                <>
                  <StatCard
                    title="Conteúdo"
                    value={stats.totalContent}
                    icon={<BookOpen className="h-6 w-6 text-white" />}
                    color="bg-purple-500"
                    subtitle="Total disponível"
                  />
                  
                  <StatCard
                    title="Progresso"
                    value={`${stats.progressPercentage}%`}
                    icon={<BarChart3 className="h-6 w-6 text-white" />}
                    color="bg-orange-500"
                    subtitle="Geral"
                  />
                </>
              )}
              
              {user?.user_type === 'professor' && (
                <>
                  <StatCard
                    title="Alunos"
                    value="0"
                    icon={<Users className="h-6 w-6 text-white" />}
                    color="bg-indigo-500"
                    subtitle="Total"
                  />
                  
                  <StatCard
                    title="Conteúdo"
                    value={stats.totalContent}
                    icon={<BookOpen className="h-6 w-6 text-white" />}
                    color="bg-purple-500"
                    subtitle="Disponível"
                  />
                </>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {user?.user_type === 'professor' ? (
                      <>
                        <Button 
                          className="w-full justify-start" 
                          variant="outline"
                          onClick={() => toast.success('Acesse uma turma para criar atividades')}
                        >
                          <Activity className="h-4 w-4 mr-2" />
                          Criar Nova Atividade
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                          <GraduationCap className="h-4 w-4 mr-2" />
                          Criar Nova Turma
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Adicionar Conteúdo
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          className="w-full justify-start" 
                          variant="outline"
                          onClick={() => toast.success('Acesse suas turmas para ver atividades')}
                        >
                          <Activity className="h-4 w-4 mr-2" />
                          Ver Atividades Pendentes
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Continuar Estudando
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Ver Progresso
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Login realizado
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date().toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    {user?.user_type === 'aluno' && (
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {stats.pendingActivities} atividades pendentes
                          </p>
                          <p className="text-xs text-gray-500">
                            Última verificação: hoje
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Nenhuma atividade recente para exibir.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </AppLayout>
    </AuthGuard>
  );
} 