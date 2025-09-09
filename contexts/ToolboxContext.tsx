import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ToolboxContextType {
  isOpen: boolean;
  openToolbox: () => void;
  closeToolbox: () => void;
  toggleToolbox: () => void;
}

const ToolboxContext = createContext<ToolboxContextType | undefined>(undefined);

export const useToolbox = () => {
  const context = useContext(ToolboxContext);
  if (!context) {
    throw new Error('useToolbox must be used within a ToolboxProvider');
  }
  return context;
};

interface ToolboxProviderProps {
  children: ReactNode;
}

export const ToolboxProvider: React.FC<ToolboxProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openToolbox = () => setIsOpen(true);
  const closeToolbox = () => setIsOpen(false);
  const toggleToolbox = () => setIsOpen(prev => !prev);

  return (
    <ToolboxContext.Provider value={{ isOpen, openToolbox, closeToolbox, toggleToolbox }}>
      {children}
    </ToolboxContext.Provider>
  );
};
