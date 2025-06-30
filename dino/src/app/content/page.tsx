'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/components/lib/store';
import { contentAPI, Content } from '@/components/lib/api';
import { Search, Filter, BookOpen, Video, Link, FileText, Play, CheckCircle, Clock, BarChart3, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useRouter } from 'next/navigation';

interface ContentWithProgress extends Content {
  progress_percentage?: number;
  is_completed?: boolean;
  last_accessed?: string;
}

export default function ContentPage() {
  const { user } = useAuthStore();
  const [content, setContent] = useState<ContentWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'apostila' | 'video' | 'link'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'in_progress' | 'not_started'>('all');
  const router = useRouter();

  const loadContent = async () => {
    try {
      setLoading(true);
      const response = await contentAPI.getAll();
      
      if (response.success) {
        const contentWithProgress = response.data.map((item: Content) => ({
          ...item,
          progress_percentage: 0, // TODO: Buscar progresso do usuário
          is_completed: false, // TODO: Verificar se foi completado
          last_accessed: null, // TODO: Buscar último acesso
        }));
        
        setContent(contentWithProgress);
      } else {
        toast.error('Erro ao carregar conteúdo');
      }
    } catch (error: any) {
      console.error('Erro ao carregar conteúdo:', error);
      toast.error('Erro ao carregar conteúdo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, [user]);

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || item.type === filterType;
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'completed' && item.is_completed) ||
                         (filterStatus === 'in_progress' && item.progress_percentage && item.progress_percentage > 0 && !item.is_completed) ||
                         (filterStatus === 'not_started' && (!item.progress_percentage || item.progress_percentage === 0));
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'apostila':
        return <FileText className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'link':
        return <Link className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'apostila':
        return 'Apostila';
      case 'video':
        return 'Vídeo';
      case 'link':
        return 'Link';
      default:
        return 'Conteúdo';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleOpenContent = (item: ContentWithProgress) => {
    router.push(`/content/${item.id}`);
  };

  const handleCreateContent = () => {
    // TODO: Implementar modal de criação de conteúdo
    toast.success('Funcionalidade em desenvolvimento');
  };

  const handleEditContent = (item: ContentWithProgress) => {
    // TODO: Implementar modal de edição de conteúdo
    toast.success('Funcionalidade em desenvolvimento');
  };

  const handleDeleteContent = async (item: ContentWithProgress) => {
    if (!confirm('Tem certeza que deseja excluir este conteúdo?')) return;
    
    try {
      const response = await contentAPI.delete(item.id);
      if (response.success) {
        toast.success('Conteúdo excluído com sucesso!');
        loadContent();
      } else {
        toast.error('Erro ao excluir conteúdo');
      }
    } catch (error: any) {
      console.error('Erro ao excluir conteúdo:', error);
      toast.error('Erro ao excluir conteúdo');
    }
  };

  const handleMarkAsCompleted = async (item: ContentWithProgress) => {
    try {
      const response = await contentAPI.markAsCompleted(item.id);
      if (response.success) {
        toast.success('Conteúdo marcado como completado!');
        loadContent(); // Recarregar para atualizar status
      }
    } catch (error: any) {
      console.error('Erro ao marcar como completado:', error);
      toast.error('Erro ao marcar como completado');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando conteúdo...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Conteúdo</h1>
            <p className="text-gray-600">
              Explore apostilas, vídeos e links educacionais
            </p>
          </div>
          
          <div className="flex gap-3">
            {user?.user_type === 'professor' && (
              <Button onClick={handleCreateContent} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Criar Conteúdo
              </Button>
            )}
            <Button variant="outline" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Ver Progresso
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar conteúdo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Todos os tipos</option>
              <option value="apostila">Apostilas</option>
              <option value="video">Vídeos</option>
              <option value="link">Links</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Todos os status</option>
              <option value="not_started">Não iniciados</option>
              <option value="in_progress">Em progresso</option>
              <option value="completed">Completados</option>
            </select>
          </div>
        </div>

        {/* Content Grid */}
        {filteredContent.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Nenhum conteúdo encontrado' : 'Nenhum conteúdo disponível'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Aguarde conteúdo ser adicionado pelos professores'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getContentIcon(item.type)}
                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                          {getContentTypeLabel(item.type)}
                        </span>
                        {!item.is_active && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            Inativo
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-lg mb-2">{item.title}</CardTitle>
                      <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    </div>
                    {item.is_completed && (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {item.duration && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Duração:</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{item.duration} min</span>
                        </div>
                      </div>
                    )}
                    
                    {item.progress_percentage !== undefined && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progresso:</span>
                          <span className={`font-medium ${getProgressColor(item.progress_percentage)}`}>
                            {item.progress_percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${item.progress_percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {item.last_accessed && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Último acesso:</span>
                        <span>{new Date(item.last_accessed).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => handleOpenContent(item)}
                      disabled={!item.is_active}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {item.is_completed ? 'Rever Conteúdo' : 'Abrir Conteúdo'}
                    </Button>
                    
                    {!item.is_completed && item.progress_percentage && item.progress_percentage > 0 && (
                      <Button 
                        variant="outline"
                        className="w-full" 
                        size="sm"
                        onClick={() => handleMarkAsCompleted(item)}
                      >
                        Marcar como Completado
                      </Button>
                    )}
                    
                    {user?.user_type === 'professor' && (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline"
                          className="flex-1" 
                          size="sm"
                          onClick={() => handleEditContent(item)}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="outline"
                          className="flex-1" 
                          size="sm"
                          onClick={() => handleDeleteContent(item)}
                        >
                          Excluir
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
} 