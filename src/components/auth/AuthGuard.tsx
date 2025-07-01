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

  // Redireciona imediatamente se não houver token
  useEffect(() => {
    if (requireAuth && typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token) {
        const currentPath = window.location.pathname;
        router.replace(`/login?returnUrl=${encodeURIComponent(currentPath)}`);
      }
    }
  }, [requireAuth, router]);

  // Inicializa autenticação
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Redireciona se não autenticado após inicialização
  useEffect(() => {
    if (!isInitialized) return;
    if (requireAuth && !isAuthenticated) {
      const currentPath = window.location.pathname;
      router.replace(`/login?returnUrl=${encodeURIComponent(currentPath)}`);
    } else if (!requireAuth && isAuthenticated) {
      router.replace('/classes');
    }
  }, [isAuthenticated, isInitialized, requireAuth, router]);

  // Mostrar loading enquanto inicializa, exceto se não houver token
  if (requireAuth && typeof window !== 'undefined' && !localStorage.getItem('token')) {
    return null; // Evita loading infinito se não houver token
  }
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