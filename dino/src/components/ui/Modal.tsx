import React from 'react';
import ReactModal from 'react-modal';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  className,
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const modalClasses = `absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full mx-4 ${sizes[size]} ${className || ''} transition-all duration-300 ease-in-out`;

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={modalClasses}
      overlayClassName="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm"
      contentLabel={title || 'Modal'}
    >
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200">
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </ReactModal>
  );
};

export default Modal; 