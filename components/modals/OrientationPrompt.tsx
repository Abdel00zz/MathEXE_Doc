import React, { useEffect, useRef, useState } from 'react';
import { useMobile } from '../../hooks/useMobile';
import { useOrientation } from '../../hooks/useOrientation';
import { useSettings } from '../../hooks/useSettings';
import { X } from 'lucide-react';

interface OrientationPromptProps {
  delayMs?: number;
}

const OrientationPrompt: React.FC<OrientationPromptProps> = ({ delayMs = 3000 }) => {
  const isMobile = useMobile();
  const orientation = useOrientation();
  const { t } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    // Nettoyer le timer existant
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Fermer immédiatement si pas mobile ou en paysage
    if (!isMobile || orientation === 'landscape') {
      setIsOpen(false);
      return;
    }

    // Programmer l'affichage après le délai
    timerRef.current = window.setTimeout(() => {
      if (mountedRef.current && isMobile && orientation === 'portrait') {
        setIsOpen(true);
      }
    }, delayMs);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [isMobile, orientation, delayMs]);

  // Fermer le modal
  const handleClose = () => {
    setIsOpen(false);
  };

  // Gestionnaire pour empêcher la fermeture par clic sur le backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isOpen || !isMobile || orientation === 'landscape') {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div 
        className="relative bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 mx-4 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton de fermeture */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Fermer"
        >
          <X size={16} />
        </button>

        {/* Contenu */}
        <div className="p-6 pt-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            {t('orientation.title') || 'Conseil d\'orientation'}
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
            {t('orientation.instruction') || 'Tournez votre appareil en mode paysage pour une meilleure expérience d\'affichage'}
          </p>

          <div className="flex justify-center">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              {t('orientation.dismiss') || 'Compris'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrientationPrompt;
