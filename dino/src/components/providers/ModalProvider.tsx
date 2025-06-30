'use client';

import { useEffect } from 'react';
import ReactModal from 'react-modal';

export default function ModalProvider() {
  useEffect(() => {
    ReactModal.setAppElement('#__next');
  }, []);

  return null;
} 