
import React, { useState, useEffect } from 'react';
import { ToastMessage } from '../../types';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

interface ToastProps {
  toast: ToastMessage;
  onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, 4700); // Start exit animation just before removal

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
  };
  
  const handleAnimationEnd = () => {
    if (isExiting) {
      onDismiss();
    }
  };
  
  const icons = {
    success: <CheckCircle2 className="h-6 w-6 text-green-500" aria-hidden="true" />,
    error: <AlertTriangle className="h-6 w-6 text-red-500" aria-hidden="true" />,
    info: <Info className="h-6 w-6 text-blue-500" aria-hidden="true" />,
  };
  
  const animationClass = '';

  return (
    <div 
      className={`max-w-sm w-full bg-white dark:bg-slate-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black dark:ring-white/10 ring-opacity-5 overflow-hidden ${animationClass}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {icons[toast.type]}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{toast.message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleDismiss}
              className="bg-white dark:bg-slate-800 rounded-md inline-flex text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;