'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/components/lib/store';
import { contentAPI, activitiesAPI } from '@/components/lib/api';
import { BarChart3, TrendingUp, BookOpen, Video, Link, Target, Calendar, Award, Clock, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface ProgressStats {
  total_content: number;
  completed_content: number;
  total_activities: number;
  completed_activities: number;
  content_progress: {
    apostila: { completed: number; total: number };
    video: { completed: number; total: number };
    link: { completed: number; total: number };
  };
  recent_activity: Array<{
    type: string;
    title: string;
    date: string;
    status: string;
  }>;
}

export default function ProgressPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProgressStats = async () => {
    try {
      setLoading(true);
      
      // Carregar estatísticas de conteúdo
      const contentResponse = await contentAPI.getContentStats();
      const activitiesResponse = await activitiesAPI.getAll();
      
      if (contentResponse.success && activitiesResponse.success) {
        const contentData = contentResponse.data;
        const activitiesData = activitiesResponse.data;
        
        // Calcular estatísticas
        const totalContent = contentData.total || 0;
        const completedContent = contentData.completed || 0;
        const totalActivities = activitiesData.length || 0;
        const completedActivities = activitiesData.filter((a: any) => a.is_completed).length || 0;
        
        const progressStats: ProgressStats = {
          total_content: totalContent,
          completed_content: completedContent,
          total_activities: totalActivities,
          completed_activities: completedActivities,
          content_progress: {
            apostila: { completed: contentData.apostila?.completed || 0, total: contentData.apostila?.total || 0 },
            video: { completed: contentData.video?.completed || 0, total: contentData.video?.total || 0 },
            link: { completed: contentData.link?.completed || 0, total: contentData.link?.total || 0 },
          },
          recent_activity: [
            // TODO: Implementar atividade recente real
            {
              type: 'content',
              title: 'Apostila de Introdução',
              date: new Date().toISOString(),
              status: 'completed'
            }
          ]
        };
        
        setStats(progressStats);
      } else {
        toast.error('Erro ao carregar estatísticas');
      }
    } catch (error: any) {
      console.error('Erro ao carregar progresso:', error);
      toast.error('Erro ao carregar progresso');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgressStats();
  }, [user]);

  const calculatePercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#42026F] mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando progresso...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!stats) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado disponível</h3>
          <p className="text-gray-600">Complete algumas atividades para ver seu progresso</p>
        </div>
      </AppLayout>
    );
  }

  const overallContentPercentage = calculatePercentage(stats.completed_content, stats.total_content);
  const overallActivitiesPercentage = calculatePercentage(stats.completed_activities, stats.total_activities);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meu Progresso</h1>
            <p className="text-gray-600">
              Acompanhe seu desenvolvimento e conquistas
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>Atualizado em {new Date().toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        {/* Overall Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Progresso Geral - Conteúdo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Conteúdo Completado</span>
                  <span className={`font-bold text-lg ${getProgressColor(overallContentPercentage)}`}>
                    {overallContentPercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor(overallContentPercentage)}`}
                    style={{ width: `${overallContentPercentage}%` }}
                  ></div>
                </div>
                <div className="text-center text-sm text-gray-500">
                  {stats.completed_content} de {stats.total_content} itens completados
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Progresso Geral - Atividades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Atividades Completadas</span>
                  <span className={`font-bold text-lg ${getProgressColor(overallActivitiesPercentage)}`}>
                    {overallActivitiesPercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor(overallActivitiesPercentage)}`}
                    style={{ width: `${overallActivitiesPercentage}%` }}
                  ></div>
                </div>
                <div className="text-center text-sm text-gray-500">
                  {stats.completed_activities} de {stats.total_activities} atividades completadas
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Type Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Progresso por Tipo de Conteúdo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Apostilas */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Apostilas</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progresso</span>
                    <span className={`font-medium ${getProgressColor(calculatePercentage(stats.content_progress.apostila.completed, stats.content_progress.apostila.total))}`}>
                      {calculatePercentage(stats.content_progress.apostila.completed, stats.content_progress.apostila.total)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(calculatePercentage(stats.content_progress.apostila.completed, stats.content_progress.apostila.total))}`}
                      style={{ width: `${calculatePercentage(stats.content_progress.apostila.completed, stats.content_progress.apostila.total)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    {stats.content_progress.apostila.completed}/{stats.content_progress.apostila.total}
                  </div>
                </div>
              </div>

              {/* Vídeos */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-red-500" />
                  <span className="font-medium">Vídeos</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progresso</span>
                    <span className={`font-medium ${getProgressColor(calculatePercentage(stats.content_progress.video.completed, stats.content_progress.video.total))}`}>
                      {calculatePercentage(stats.content_progress.video.completed, stats.content_progress.video.total)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(calculatePercentage(stats.content_progress.video.completed, stats.content_progress.video.total))}`}
                      style={{ width: `${calculatePercentage(stats.content_progress.video.completed, stats.content_progress.video.total)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    {stats.content_progress.video.completed}/{stats.content_progress.video.total}
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Link className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Links</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progresso</span>
                    <span className={`font-medium ${getProgressColor(calculatePercentage(stats.content_progress.link.completed, stats.content_progress.link.total))}`}>
                      {calculatePercentage(stats.content_progress.link.completed, stats.content_progress.link.total)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(calculatePercentage(stats.content_progress.link.completed, stats.content_progress.link.total))}`}
                      style={{ width: `${calculatePercentage(stats.content_progress.link.completed, stats.content_progress.link.total)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    {stats.content_progress.link.completed}/{stats.content_progress.link.total}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recent_activity.length === 0 ? (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma atividade recente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recent_activity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activity.status === 'completed' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {activity.status === 'completed' ? 'Completado' : 'Em andamento'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
} 