'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { notesAPI } from '@/components/lib/api';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  presetContentType?: 'general' | 'apostila' | 'video' | 'activity';
  presetContentId?: number;
}

export default function CreateNoteModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  presetContentType,
  presetContentId 
}: CreateNoteModalProps) {
  const [createForm, setCreateForm] = useState({
    title: '',
    content: '',
    content_type: 'general' as 'general' | 'apostila' | 'video' | 'activity',
    content_id: undefined as number | undefined
  });

  // Atualizar o formulário quando as props mudarem
  useEffect(() => {
    if (presetContentType) {
      setCreateForm(prev => ({
        ...prev,
        content_type: presetContentType,
        content_id: presetContentId
      }));
    }
  }, [presetContentType, presetContentId]);

  const handleSubmitCreate = async () => {
    if (!createForm.title.trim() || !createForm.content.trim()) {
      toast.error('Título e conteúdo são obrigatórios');
      return;
    }

    try {
      const response = await notesAPI.create({
        title: createForm.title,
        content: createForm.content,
        content_type: createForm.content_type,
        content_id: createForm.content_id
      });

      if (response.success) {
        toast.success('Nota criada com sucesso!');
        onClose();
        resetForm();
        onSuccess();
      }
    } catch (error: any) {
      console.error('Erro ao criar nota:', error);
      toast.error('Erro ao criar nota');
    }
  };

  const resetForm = () => {
    setCreateForm({
      title: '',
      content: '',
      content_type: presetContentType || 'general',
      content_id: presetContentId
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Criar Nova Nota"
      size="lg"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título *
          </label>
          <Input
            value={createForm.title}
            onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
            placeholder="Título da nota"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Conteúdo *
          </label>
          <textarea
            value={createForm.content}
            onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
            placeholder="Digite suas anotações..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#42026F] resize-none"
            rows={6}
          />
          <div className="text-xs text-gray-500 mt-1">
            {createForm.content.split(/\s+/).filter(word => word.length > 0).length} / 500 palavras
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Conteúdo
            </label>
            <select
              value={createForm.content_type}
              onChange={(e) => setCreateForm({ 
                ...createForm, 
                content_type: e.target.value as any,
                content_id: presetContentId // Manter o ID pré-definido
              })}
              disabled={!!presetContentType}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#42026F] ${
                presetContentType ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            >
              <option value="general">Geral</option>
              <option value="apostila">Apostila</option>
              <option value="video">Vídeo</option>
              <option value="activity">Atividade</option>
            </select>
          </div>
          
          {createForm.content_type !== 'general' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID do Conteúdo
              </label>
              <Input
                type="number"
                value={createForm.content_id || ''}
                onChange={(e) => setCreateForm({ 
                  ...createForm, 
                  content_id: e.target.value ? Number(e.target.value) : undefined 
                })}
                placeholder="ID do conteúdo"
                disabled={!!presetContentId}
                className={presetContentId ? 'bg-gray-100 cursor-not-allowed' : ''}
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={handleClose}>
          Cancelar
        </Button>
        <Button onClick={handleSubmitCreate}>
          <Plus className="h-4 w-4 mr-2" /> Criar Nota
        </Button>
      </div>
    </Modal>
  );
} 