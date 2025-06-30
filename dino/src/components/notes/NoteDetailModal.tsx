'use client';

import { Download, StickyNote, FileText, Video, Activity } from 'lucide-react';
import { Note } from '@/components/lib/api';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface NoteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
  onDownload: (note: Note) => void;
}

export default function NoteDetailModal({ isOpen, onClose, note, onDownload }: NoteDetailModalProps) {
  const getNoteIcon = (contentType: string) => {
    switch (contentType) {
      case 'activity':
        return <Activity className="h-5 w-5 text-[#42026F]" />;
      case 'apostila':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'video':
        return <Video className="h-5 w-5 text-red-600" />;
      case 'general':
        return <StickyNote className="h-5 w-5 text-green-600" />;
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  if (!note) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalhes da Nota: ${note.title}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Header com informações básicas */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {getNoteIcon(note.content_type)}
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{note.title}</h3>
              <p className="text-sm text-gray-600">{getNoteTypeLabel(note.content_type)}</p>
            </div>
          </div>
        </div>

        {/* Conteúdo completo */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Conteúdo Completo</h4>
          <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-gray-700 font-sans text-sm">{note.content}</pre>
          </div>
        </div>

        {/* Informações detalhadas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Informações Gerais</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID da Nota:</span>
                  <span className="font-medium">{note.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo de Conteúdo:</span>
                  <span className="font-medium">{getNoteTypeLabel(note.content_type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ID do Conteúdo:</span>
                  <span className="font-medium">{note.content_id || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contagem de Palavras:</span>
                  <span className="font-medium">{note.word_count || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Datas</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Criada em:</span>
                  <span className="font-medium">{formatDate(note.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Última atualização:</span>
                  <span className="font-medium">{formatDate(note.updated_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Último salvamento:</span>
                  <span className="font-medium">{formatDate(note.last_saved)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Estatísticas</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-[#42026F]/5 rounded-lg">
              <div className="text-2xl font-bold text-[#42026F]">{note.word_count || 0}</div>
              <div className="text-xs text-[#42026F]">Palavras</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{note.content.length}</div>
              <div className="text-xs text-blue-600">Caracteres</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{Math.ceil((note.word_count || 0) / 500 * 100)}%</div>
              <div className="text-xs text-green-600">Limite</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
        <Button onClick={() => onDownload(note)}>
          <Download className="h-4 w-4 mr-2" /> Download
        </Button>
      </div>
    </Modal>
  );
} 