'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/components/lib/store';
import {
  Home,
  BookOpen,
  Users,
  FileText,
  Video,
  Link as LinkIcon,
  StickyNote,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  GraduationCap,
  BarChart3,
  Bell,
} from 'lucide-react';
import Button from '@/components/ui/Button';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  children?: SidebarItem[];
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const handleLogout = () => {
    logout();
  };

  const sidebarItems: SidebarItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <Home className="h-5 w-5" />,
    },
    {
      label: 'Turmas',
      href: '/classes',
      icon: <GraduationCap className="h-5 w-5" />,
    },
    {
      label: 'Conteúdo',
      href: '/content',
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      label: 'Notas',
      href: '/notes',
      icon: <StickyNote className="h-5 w-5" />,
    },
    {
      label: 'Progresso',
      href: '/progress',
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      label: 'Feedback',
      href: '/feedback',
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      label: 'Configurações',
      href: '/settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const isActive = pathname === item.href;
    const isExpanded = expandedItems.includes(item.label);
    const hasChildren = item.children && item.children.length > 0;

    const itemClasses = `flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${level > 0 ? 'ml-4' : ''} ${isActive ? 'bg-[#42026F]/10 text-[#42026F]' : 'text-gray-700 hover:bg-gray-100'}`;

    return (
      <div key={item.label}>
        <Link
          href={hasChildren ? '#' : item.href}
          onClick={hasChildren ? (e) => {
            e.preventDefault();
            toggleExpanded(item.label);
          } : undefined}
          className={itemClasses}
        >
          <div className="flex items-center space-x-3">
            {item.icon}
            <span>{item.label}</span>
          </div>
          {hasChildren && (
            <ChevronDown
              className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          )}
          {item.badge && (
            <span className="bg-[#42026F]/10 text-[#42026F] text-xs px-2 py-1 rounded-full">
              {item.badge}
            </span>
          )}
        </Link>
        
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const sidebarClasses = `fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`;

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={sidebarClasses}>
        <div className="flex flex-col h-full">
          {/* User info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-[#42026F]/10 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-[#42026F]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.user_type}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <div className="lg:hidden mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="w-full justify-start"
              >
                <X className="h-5 w-5 mr-2" />
                Fechar menu
              </Button>
            </div>
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                pathname === '/dashboard'
                  ? 'bg-[#42026F]/10 text-[#42026F]'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/classes"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                pathname === '/classes'
                  ? 'bg-[#42026F]/10 text-[#42026F]'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BookOpen className="h-5 w-5" />
              <span>Turmas</span>
            </Link>

            <Link
              href="/content"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                pathname === '/content'
                  ? 'bg-[#42026F]/10 text-[#42026F]'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FileText className="h-5 w-5" />
              <span>Conteúdo</span>
            </Link>

            <Link
              href="/progress"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                pathname === '/progress'
                  ? 'bg-[#42026F]/10 text-[#42026F]'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span>Progresso</span>
            </Link>

            <Link
              href="/notes"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                pathname === '/notes'
                  ? 'bg-[#42026F]/10 text-[#42026F]'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <StickyNote className="h-5 w-5" />
              <span>Notas</span>
            </Link>

            <Link
              href="/notifications"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                pathname === '/notifications'
                  ? 'bg-[#42026F]/10 text-[#42026F]'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Bell className="h-5 w-5" />
              <span>Notificações</span>
            </Link>

            <Link
              href="/feedback"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                pathname === '/feedback'
                  ? 'bg-[#42026F]/10 text-[#42026F]'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <MessageSquare className="h-5 w-5" />
              <span>Feedback</span>
            </Link>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-gray-700 hover:text-red-600"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
} 