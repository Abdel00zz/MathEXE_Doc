
import React, { useState, useRef } from 'react';
import { FunctionSquare, Menu, Plus, Search, Import, Settings, HelpCircle } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onNewDocument?: () => void;
  onSearch?: () => void;
  onImport?: () => void;
  onSettings?: () => void;
  onHelp?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onNewDocument,
  onSearch,
  onImport,
  onSettings,
  onHelp
}) => {
  const { t } = useSettings();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  useOnClickOutside(menuRef, () => setMenuOpen(false));

  const handleMenuAction = (action?: () => void) => {
    action?.();
    setMenuOpen(false);
  };

  return (
    <header className="bg-white dark:bg-gray-900 sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">
            <FunctionSquare size={28} className="text-indigo-600 dark:text-indigo-500" />
            <span className="hidden xs:inline sm:inline">{t('appName')}</span>
          </Link>
          
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Menu"
            >
              <Menu size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                {/* Actions principales */}
                <button
                  onClick={() => handleMenuAction(onNewDocument)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Plus size={14} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium text-sm">{t('menu.new')}</span>
                </button>
                
                <button
                  onClick={() => handleMenuAction(onImport)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Import size={14} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="font-medium text-sm">{t('menu.import')}</span>
                </button>
                
                {/* Navigation */}
                <button
                  onClick={() => handleMenuAction(onSearch)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Search size={14} className="text-green-600 dark:text-green-400" />
                  </div>
                  <span className="font-medium text-sm">{t('menu.search')}</span>
                </button>
                
                {/* Séparateur */}
                <div className="my-1.5 h-px bg-gray-200 dark:bg-gray-700 mx-2" />
                
                {/* Configuration et aide */}
                <button
                  onClick={() => handleMenuAction(onSettings)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-900/30 flex items-center justify-center">
                    <Settings size={14} className="text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="font-medium text-sm">{t('menu.settings')}</span>
                </button>
                
                <button
                  onClick={() => handleMenuAction(onHelp)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <HelpCircle size={14} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="font-medium text-sm">{t('menu.help')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
