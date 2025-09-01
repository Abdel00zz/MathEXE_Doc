
import { useContext } from 'react';
import { SettingsContext } from '../contexts/AppContext';

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within an AppProvider');
  }
  return context;
};
