'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../components/lib/store';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isInitialized, initialize } = useAuthStore();

  useEffect(() => {
    // Inicializar autenticação na primeira renderização
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  useEffect(() => {
    // Aguardar a inicialização antes de fazer redirecionamentos
    if (!isInitialized) return;

    if (requireAuth && !isAuthenticated) {
      const currentPath = window.location.pathname;
      router.push(`/login?returnUrl=${encodeURIComponent(currentPath)}`);
    } else if (!requireAuth && isAuthenticated) {
      router.push('/classes');
    }
  }, [isAuthenticated, isInitialized, requireAuth, router]);

  // Mostrar loading enquanto inicializa
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#42026F]/5 to-[#42026F]/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#42026F] mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não requer autenticação ou está autenticado, mostrar conteúdo
  if (!requireAuth || isAuthenticated) {
    return <>{children}</>;
  }

  // Se requer autenticação mas não está autenticado, mostrar loading (será redirecionado)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#42026F]/5 to-[#42026F]/10">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#42026F] mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecionando...</p>
      </div>
    </div>
  );
} 