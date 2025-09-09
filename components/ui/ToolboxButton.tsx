import React from 'react';
import { Menu } from 'lucide-react';
import Button from '../ui/Button';
import Tooltip from '../ui/Tooltip';
import { useToolbox } from '../../contexts/ToolboxContext';

interface ToolboxButtonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ToolboxButton: React.FC<ToolboxButtonProps> = ({ className = '', size = 'md' }) => {
  const { openToolbox } = useToolbox();

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <Tooltip text="Ouvrir la boîte à outils">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={openToolbox}
        className={`${sizeClasses[size]} rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 group ${className}`}
      >
        <Menu size={iconSizes[size]} className="group-hover:scale-110 transition-transform duration-200" />
      </Button>
    </Tooltip>
  );
};

export default ToolboxButton;
