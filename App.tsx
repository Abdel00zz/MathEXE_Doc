
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Dashboard from './components/document/Dashboard';
import DocumentEditor from './components/document/DocumentEditor';
import { useSettings } from './hooks/useSettings';
import Spinner from './components/ui/Spinner';
import { WifiOff, RefreshCw } from 'lucide-react';
import Button from './components/ui/Button';

function App() {
  const { settings } = useSettings();

  React.useEffect(() => {
    if (settings?.language) {
      document.documentElement.lang = settings.language;
    }
  }, [settings?.language]);
  
  React.useEffect(() => {
    const root = window.document.documentElement;
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', isDark);
  }, [settings.theme]);

  

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-950">
      <Header />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/document/:id" element={<DocumentEditor />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;