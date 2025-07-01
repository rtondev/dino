'use client';

import { Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function NotificationsTab() {

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Preferências de Notificação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-6">
              <h3 className="text-lg font-medium text-yellow-800 mb-2">
                🚧 Em Desenvolvimento
              </h3>
              <p className="text-yellow-700">
                As configurações de notificação estarão disponíveis em breve.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 