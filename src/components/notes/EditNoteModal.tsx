'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { notesAPI, Note } from '@/components/lib/api';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface EditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  note: Note | null;
}

export default function EditNoteModal({ isOpen, onClose, onSuccess, note }: EditNoteModalProps) {
  const [editForm, setEditForm] = useState({
    title: '',
    content: ''
  });

  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Carregar dados da nota quando o modal abrir
  useEffect(() => {
    if (note && isOpen) {
      setEditForm({
        title: note.title,
        content: note.content
      });
    }
  }, [note, isOpen]);

  // Limpar timeout quando o modal fechar
  useEffect(() => {
    if (!isOpen && autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
      setAutoSaveTimeout(null);
    }
  }, [isOpen, autoSaveTimeout]);

  const handleAutoSave = async (content: string) => {
    if (!note) return;
    
    try {
      await notesAPI.autoSave(note.id, { content });
      console.log('Auto-save realizado com sucesso');
    } catch (error: any) {
      console.error('Erro no auto-save:', error);
    }
  };

  const handleContentChange = (content: string) => {
    setEditForm({ ...editForm, content });

    // Limpar timeout anterior
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Configurar novo timeout para auto-save
    const timeout = setTimeout(() => {
      handleAutoSave(content);
    }, 2000);

    setAutoSaveTimeout(timeout);
  };

  const handleSaveNote = async () => {
    if (!note) return;
    
    if (!editForm.title.trim() || !editForm.content.trim()) {
      toast.error('Título e conteúdo são obrigatórios');
      return;
    }

    try {
      const response = await notesAPI.update(note.id, {
        title: editForm.title,
        content: editForm.content,
      });
      
      if (response.success) {
        toast.success('Nota salva com sucesso!');
        onClose();
        onSuccess();
      }
    } catch (error: any) {
      console.error('Erro ao salvar nota:', error);
      toast.error('Erro ao salvar nota');
    }
  };

  const handleClose = () => {
    // Limpar timeout de auto-save
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
      setAutoSaveTimeout(null);
    }
    onClose();
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

  if (!note) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Nota"
      size="lg"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título *
          </label>
          <Input
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            placeholder="Título da nota"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Conteúdo *
          </label>
          <textarea
            value={editForm.content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Digite suas anotações..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#42026F] resize-none"
            rows={8}
          />
          <div className="text-xs text-gray-500 mt-1">
            {editForm.content.split(/\s+/).filter(word => word.length > 0).length} / 500 palavras
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Conteúdo
            </label>
            <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
              {getNoteTypeLabel(note.content_type)}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID do Conteúdo
            </label>
            <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
              {note.content_id || 'N/A'}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 <strong>Auto-save ativo:</strong> Suas alterações são salvas automaticamente a cada 2 segundos de inatividade.
          </p>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={handleClose}>
          Cancelar
        </Button>
        <Button onClick={handleSaveNote}>
          <Save className="h-4 w-4 mr-2" /> Salvar Alterações
        </Button>
      </div>
    </Modal>
  );
} 