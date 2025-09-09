
import React from 'react';
import { FunctionSquare } from 'lucide-react';
import ToolboxButton from '../ui/ToolboxButton';
import { useSettings } from '../../hooks/useSettings';
import { useMobile } from '../../hooks/useMobile';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const { t } = useSettings();
  const isMobile = useMobile();

  return (
    <header className="bg-white dark:bg-gray-900 sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">
            <FunctionSquare size={28} className="text-indigo-600 dark:text-indigo-500" />
            <span className="hidden xs:inline sm:inline">{t('appName')}</span>
          </Link>
          
          {isMobile && (
            <div className="flex items-center">
              <ToolboxButton size="sm" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
