'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/components/lib/store';
import { feedbackAPI } from '@/components/lib/api';
import { MessageSquare, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface FeedbackForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function FeedbackTab() {
  const { user } = useAuthStore();
  const [feedbackForm, setFeedbackForm] = useState<FeedbackForm>({
    name: user?.username || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });
  const [sendingFeedback, setSendingFeedback] = useState(false);

  useEffect(() => {
    if (user) {
      setFeedbackForm(prev => ({
        ...prev,
        name: user.username || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleFeedbackChange = (field: keyof FeedbackForm, value: string) => {
    setFeedbackForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSendFeedback = async () => {
    if (!feedbackForm.name.trim() || !feedbackForm.email.trim() || !feedbackForm.subject.trim() || !feedbackForm.message.trim()) {
      toast.error('Nome, email, assunto e mensagem são obrigatórios');
      return;
    }

    try {
      setSendingFeedback(true);
      const payload = {
        name: feedbackForm.name,
        email: feedbackForm.email,
        subject: feedbackForm.subject,
        message: feedbackForm.message
      };
      const data = await feedbackAPI.create(payload);
      if (data.success) {
        toast.success('Feedback enviado com sucesso!');
        setFeedbackForm(prev => ({
          ...prev,
          subject: '',
          message: ''
        }));
      } else {
        toast.error(data.message || 'Erro ao enviar feedback');
      }
    } catch (error: any) {
      toast.error('Erro ao enviar feedback');
    } finally {
      setSendingFeedback(false);
    }
  };

  const getWordCount = () => {
    return feedbackForm.message.split(/\s+/).filter(word => word.length > 0).length;
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Enviar Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Como funciona:</strong> Seu feedback será enviado diretamente por email para nossa equipe. 
            Você verá uma mensagem de confirmação na tela quando o feedback for enviado com sucesso.
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome *
          </label>
          <Input
            value={feedbackForm.name}
            onChange={(e) => handleFeedbackChange('name', e.target.value)}
            placeholder="Seu nome"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <Input
            type="email"
            value={feedbackForm.email}
            onChange={(e) => handleFeedbackChange('email', e.target.value)}
            placeholder="seu@email.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assunto *
          </label>
          <Input
            value={feedbackForm.subject}
            onChange={(e) => handleFeedbackChange('subject', e.target.value)}
            placeholder="Digite o assunto do seu feedback"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mensagem *
          </label>
          <textarea
            value={feedbackForm.message}
            onChange={(e) => handleFeedbackChange('message', e.target.value)}
            placeholder="Descreva seu feedback, sugestão ou reporte um problema..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#42026F] resize-none"
            rows={6}
          />
          <div className="text-xs text-gray-500 mt-1">
            {getWordCount()} palavras
          </div>
        </div>
        
        <div className="pt-4">
          <Button 
            onClick={handleSendFeedback} 
            disabled={sendingFeedback || !feedbackForm.name.trim() || !feedbackForm.email.trim() || !feedbackForm.subject.trim() || !feedbackForm.message.trim()}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {sendingFeedback ? 'Enviando...' : 'Enviar Feedback'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 