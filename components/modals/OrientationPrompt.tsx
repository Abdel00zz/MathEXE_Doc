import React, { useEffect, useRef, useState } from 'react';
import Modal from '../ui/Modal';
import { useMobile } from '../../hooks/useMobile';
import { useOrientation } from '../../hooks/useOrientation';

interface OrientationPromptProps {
  delayMs?: number;
}

const OrientationPrompt: React.FC<OrientationPromptProps> = ({ delayMs = 3000 }) => {
  const isMobile = useMobile();
  const orientation = useOrientation();
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isMobile) return setIsOpen(false);
    if (orientation === 'landscape') return setIsOpen(false);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setIsOpen(true), delayMs);
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, [isMobile, orientation, delayMs]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Astuce d’orientation" size="sm" backdrop="transparent">
      <div className="text-center space-y-3">
        <div className="mx-auto w-14 h-8 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
          <div className="w-6 h-6 bg-slate-300 dark:bg-slate-600 rounded-sm" />
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300">Pour une meilleure expérience, basculez votre appareil en mode paysage.</p>
      </div>
    </Modal>
  );
};

export default OrientationPrompt;
