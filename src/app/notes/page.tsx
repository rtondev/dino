'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/components/lib/store';
import { notesAPI, Note } from '@/components/lib/api';
import { Plus, Search, Filter, StickyNote, FileText, Video, Activity, Calendar, Edit, Trash2, Save, Download, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import CreateNoteModal from '@/components/notes/CreateNoteModal';
import EditNoteModal from '@/components/notes/EditNoteModal';
import NoteDetailModal from '@/components/notes/NoteDetailModal';
import AuthGuard from '@/components/auth/AuthGuard';

interface NoteWithDetails extends Note {
  content_preview?: string;
  is_editing?: boolean;
}

export default function NotesPage() {
  const { user } = useAuthStore();
  const [notes, setNotes] = useState<NoteWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'activity' | 'apostila' | 'video' | 'general'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<NoteWithDetails | null>(null);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const response = await notesAPI.getAll();
      
      console.log('Resposta completa da API:', response);
      console.log('Dados das notas:', response.data);
      
      if (response.success) {
        const notesWithDetails = response.data.map((note: Note) => {
          console.log('Nota individual:', note);
          console.log('last_saved da nota:', note.last_saved);
          console.log('Tipo do last_saved:', typeof note.last_saved);
          
          return {
            ...note,
            content_preview: note.content.length > 100 ? note.content.substring(0, 100) + '...' : note.content,
            is_editing: false,
          };
        });
        
        setNotes(notesWithDetails);
      } else {
        toast.error('Erro ao carregar notas');
      }
    } catch (error: any) {
      console.error('Erro ao carregar notas:', error);
      toast.error('Erro ao carregar notas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [user]);

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || note.content_type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getNoteIcon = (contentType: string) => {
    switch (contentType) {
      case 'activity':
        return <Activity className="h-5 w-5 text-[#42026F]" />;
      case 'apostila':
        return <FileText className="h-5 w-5 text-[#42026F]" />;
      case 'video':
        return <Video className="h-5 w-5 text-[#42026F]" />;
      case 'general':
        return <StickyNote className="h-5 w-5 text-[#42026F]" />;
      default:
        return <StickyNote className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNoteTypeLabel = (contentType: string) => {
    switch (contentType) {
      case 'activity':
        return 'Atividade';
      case 'apostila':
        return 'Apostila';
      case 'video':
        return 'Vídeo';
      case 'general':
        return 'Geral';
      default:
        return 'Nota';
    }
  };

  const handleCreateNote = () => {
    setShowCreateModal(true);
  };

  const handleEditNote = (note: NoteWithDetails) => {
    setSelectedNote(note);
    setShowEditModal(true);
  };

  const handleViewNoteDetail = (note: NoteWithDetails) => {
    setSelectedNote(note);
    setShowDetailModal(true);
  };

  const handleDeleteNote = async (note: NoteWithDetails) => {
    if (!confirm('Tem certeza que deseja excluir esta nota?')) return;
    
    try {
      const response = await notesAPI.delete(note.id);
      if (response.success) {
        toast.success('Nota excluída com sucesso!');
        loadNotes();
      }
    } catch (error: any) {
      console.error('Erro ao excluir nota:', error);
      toast.error('Erro ao excluir nota');
    }
  };

  const handleDownloadNote = (note: NoteWithDetails) => {
    const content = `Título: ${note.title}\n\nConteúdo:\n${note.content}\n\nTipo: ${getNoteTypeLabel(note.content_type)}\nData: ${note.last_saved ? new Date(note.last_saved).toLocaleDateString('pt-BR') : 'N/A'}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    console.log('formatDate recebeu:', dateString);
    console.log('Tipo do dateString:', typeof dateString);
    
    if (!dateString) {
      console.log('dateString está vazio/null/undefined');
      return 'N/A';
    }
    
    try {
      const date = new Date(dateString);
      console.log('Data criada:', date);
      console.log('Data é válida?', !isNaN(date.getTime()));
      
      if (isNaN(date.getTime())) {
        console.log('Data inválida detectada');
        return 'Data inválida';
      }
      
      const formatted = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      console.log('Data formatada:', formatted);
      return formatted;
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <AppLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#42026F] mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando notas...</p>
            </div>
          </div>
        </AppLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <AppLayout>
        <div className="space-y-6 min-h-screen p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Minhas Notas</h1>
              <p className="text-gray-600">Crie, edite e organize suas anotações vinculadas a conteúdos.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <Input
                placeholder="Buscar nota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64"
              />
              <Button 
                onClick={handleCreateNote} 
                className="flex items-center gap-2 px-6 py-2 whitespace-nowrap"
              >
                <Plus className="h-4 w-4" /> Nova Nota
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-2 mb-4 border-b border-gray-200 pb-2">
            <Button
              variant={filterType === 'all' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('all')}
              className={filterType === 'all' ? 'bg-[#42026F]/10 text-[#42026F] hover:bg-[#42026F]/20' : ''}
            >
              Todas
            </Button>
            <Button
              variant={filterType === 'activity' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('activity')}
              className={filterType === 'activity' ? 'bg-[#42026F]/10 text-[#42026F] hover:bg-[#42026F]/20' : ''}
            >
              Atividades
            </Button>
            <Button
              variant={filterType === 'apostila' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('apostila')}
              className={filterType === 'apostila' ? 'bg-[#42026F]/10 text-[#42026F] hover:bg-[#42026F]/20' : ''}
            >
              Apostilas
            </Button>
            <Button
              variant={filterType === 'video' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('video')}
              className={filterType === 'video' ? 'bg-[#42026F]/10 text-[#42026F] hover:bg-[#42026F]/20' : ''}
            >
              Vídeos
            </Button>
            <Button
              variant={filterType === 'general' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('general')}
              className={filterType === 'general' ? 'bg-[#42026F]/10 text-[#42026F] hover:bg-[#42026F]/20' : ''}
            >
              Gerais
            </Button>
          </div>

          {/* Notes Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#42026F] mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando notas...</p>
              </div>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-16">
              <StickyNote className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma nota encontrada</h3>
              <p className="text-gray-600">Crie sua primeira nota para começar a organizar seus estudos!</p>
              <Button onClick={handleCreateNote} className="mt-4">
                <Plus className="h-4 w-4" /> Nova Nota
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotes.map((note, idx) => (
                <div key={note.id} className="bg-white rounded-xl shadow-sm p-5 transition-all border border-gray-100 hover:shadow-md">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      {getNoteIcon(note.content_type)}
                      <span className="font-semibold text-lg text-gray-900 truncate">{note.title}</span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {getNoteTypeLabel(note.content_type)}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-gray-700 whitespace-pre-line line-clamp-4 h-20 overflow-hidden">
                      {note.content_preview || note.content}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <span>{note.word_count || 0} palavras</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(note.last_saved)}</span>
                      </div>
                    </div>

                    <div className="flex gap-1 pt-2 border-t border-gray-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewNoteDetail(note)}
                        className="h-8 w-8 p-0 text-[#42026F] hover:text-[#42026F]/80 flex-1"
                        title="Ver Detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadNote(note)}
                        className="h-8 w-8 p-0 text-[#42026F] hover:text-[#42026F]/80 flex-1"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditNote(note)}
                        className="h-8 w-8 p-0 text-[#42026F] hover:text-[#42026F]/80 flex-1"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(note)}
                        className="h-8 w-8 p-0 text-[#42026F] hover:text-[#42026F]/80 flex-1"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Note Modal */}
        <CreateNoteModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadNotes}
        />

        {/* Detail Note Modal */}
        <NoteDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          note={selectedNote}
          onDownload={handleDownloadNote}
        />

        {/* Edit Note Modal */}
        <EditNoteModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={loadNotes}
          note={selectedNote}
        />
      </AppLayout>
    </AuthGuard>
  );
} 