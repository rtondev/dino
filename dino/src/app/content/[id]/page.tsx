'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/components/lib/store';
import { contentAPI } from '@/components/lib/api';
import { ArrowLeft, FileText, Video, Link, ExternalLink, Download, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface ContentDetails {
  id: number;
  title: string;
  description: string;
  type: 'apostila' | 'video' | 'link';
  file_path?: string;
  url?: string;
  duration?: number;
  progress_percentage: number;
  is_completed: boolean;
}

export default function ContentViewerPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [content, setContent] = useState<ContentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [videoProgress, setVideoProgress] = useState(0);

  const loadContent = async () => {
    try {
      setLoading(true);
      const response = await contentAPI.getById(Number(id));
      
      if (response.success) {
        setContent(response.data);
      } else {
        toast.error('Erro ao carregar conteúdo');
        router.push('/content');
      }
    } catch (error: any) {
      console.error('Erro ao carregar conteúdo:', error);
      toast.error('Erro ao carregar conteúdo');
      router.push('/content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadContent();
    }
  }, [id]);

  const handlePageChange = async (page: number) => {
    if (content?.type === 'apostila') {
      setCurrentPage(page);
      
      // Registrar progresso
      try {
        await contentAPI.recordApostilaProgress(Number(id), {
          page,
          total_pages: totalPages
        });
      } catch (error) {
        console.error('Erro ao registrar progresso:', error);
      }
    }
  };

  const handleVideoProgress = async (progress: number) => {
    if (content?.type === 'video') {
      setVideoProgress(progress);
      
      // Registrar progresso quando vídeo terminar
      if (progress >= 100) {
        try {
          await contentAPI.recordVideoProgress(Number(id), { progress });
          toast.success('Vídeo concluído!');
        } catch (error) {
          console.error('Erro ao registrar progresso:', error);
        }
      }
    }
  };

  const handleExternalLink = () => {
    if (content?.url) {
      window.open(content.url, '_blank');
    }
  };

  const getContentIcon = () => {
    switch (content?.type) {
      case 'apostila':
        return <FileText className="h-6 w-6" />;
      case 'video':
        return <Video className="h-6 w-6" />;
      case 'link':
        return <Link className="h-6 w-6" />;
      default:
        return <BookOpen className="h-6 w-6" />;
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#42026F] mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando conteúdo...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!content) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Conteúdo não encontrado</h3>
          <p className="text-gray-600">O conteúdo solicitado não existe ou foi removido</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/content')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          
          <div className="flex items-center gap-2">
            {getContentIcon()}
            <h1 className="text-2xl font-bold text-gray-900">{content.title}</h1>
          </div>
        </div>

        {/* Content Viewer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{content.title}</span>
              <div className="flex items-center gap-2">
                {content.type === 'link' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExternalLink}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Abrir Link
                  </Button>
                )}
                {content.type === 'apostila' && content.file_path && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(content.file_path, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Description */}
              {content.description && (
                <p className="text-gray-600">{content.description}</p>
              )}

              {/* Content Viewer */}
              <div className="border rounded-lg overflow-hidden">
                {content.type === 'apostila' && content.file_path && (
                  <div className="h-96">
                    <iframe
                      src={`${content.file_path}#toolbar=1&navpanes=1&scrollbar=1`}
                      className="w-full h-full"
                      title={content.title}
                    />
                  </div>
                )}

                {content.type === 'video' && content.url && (
                  <div className="aspect-video">
                    <iframe
                      src={content.url}
                      className="w-full h-full"
                      title={content.title}
                      allowFullScreen
                      onLoad={() => {
                        // Simular progresso do vídeo
                        const interval = setInterval(() => {
                          setVideoProgress(prev => {
                            if (prev >= 100) {
                              clearInterval(interval);
                              return 100;
                            }
                            return prev + 10;
                          });
                        }, 5000);
                      }}
                    />
                  </div>
                )}

                {content.type === 'link' && (
                  <div className="p-8 text-center">
                    <Link className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Este conteúdo é um link externo. Clique no botão acima para abrir.
                    </p>
                    <Button onClick={handleExternalLink}>
                      Abrir Link Externo
                    </Button>
                  </div>
                )}
              </div>

              {/* Progress Controls */}
              {content.type === 'apostila' && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage <= 1}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-gray-600">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage >= totalPages}
                    >
                      Próxima
                    </Button>
                  </div>
                  <div className="text-sm text-gray-500">
                    Progresso: {Math.round((currentPage / totalPages) * 100)}%
                  </div>
                </div>
              )}

              {content.type === 'video' && (
                <div className="flex items-center justify-between">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-4">
                    <div
                      className="bg-[#42026F] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${videoProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {videoProgress}% concluído
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
} 