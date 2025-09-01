
import React, { useState, useEffect, useCallback } from 'react';
import { AppSettings } from '../../types';
import { useSettings } from '../../hooks/useSettings';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Save, X, Sun, Moon, Laptop, Loader2, CheckCircle, AlertCircle, Image } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type VerificationStatus = 'idle' | 'verifying' | 'valid' | 'invalid';

const VerificationStatusIndicator: React.FC<{status: VerificationStatus, t: (key: string) => string}> = ({ status, t }) => {
    if (status === 'idle') return null;

    const statusMap = {
        verifying: {
            icon: <Loader2 size={16} className="animate-spin" />,
            text: t('modals.settings.verification.verifying'),
            color: 'text-slate-500 dark:text-slate-400'
        },
        valid: {
            icon: <CheckCircle size={16} />,
            text: t('modals.settings.verification.valid'),
            color: 'text-green-600 dark:text-green-500'
        },
        invalid: {
            icon: <AlertCircle size={16} />,
            text: t('modals.settings.verification.invalid'),
            color: 'text-red-600 dark:text-red-500'
        }
    };

    const currentStatus = statusMap[status];

    return (
        <div className={`flex items-center gap-2 text-sm font-medium ${currentStatus.color}`}>
            {currentStatus.icon}
            <span>{currentStatus.text}</span>
        </div>
    );
};


const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, t, verifyApiKey } = useSettings();
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');


  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
      setVerificationStatus('idle');
    }
  }, [isOpen, settings]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'apiKey') {
        setVerificationStatus('idle');
    }
    setLocalSettings(prev => ({ ...prev, [name]: value as any }));
  }, []);

  const handleThemeChange = useCallback((theme: 'light' | 'dark' | 'system') => {
    setLocalSettings(prev => ({ ...prev, theme }));
  }, []);
  const handleToggleAutoAnalyze = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.checked;
    setLocalSettings(prev => ({ ...prev, autoAnalyzeImages: value }));
    updateSettings({ autoAnalyzeImages: value }); // persist immediately
  }, [updateSettings]);
  
  const handleVerify = async () => {
    setVerificationStatus('verifying');
    const isValid = await verifyApiKey(localSettings.apiKey || '');
    setVerificationStatus(isValid ? 'valid' : 'invalid');
  };

  const handleSave = useCallback(() => {
    setIsSaving(true);
    setTimeout(() => {
      updateSettings(localSettings);
      setIsSaving(false);
      onClose();
    }, 300);
  }, [localSettings, onClose, updateSettings]);

  const themeOptions = [
    { value: 'light', label: 'Light', icon: <Sun size={16} /> },
    { value: 'dark', label: 'Dark', icon: <Moon size={16} /> },
    { value: 'system', label: 'System', icon: <Laptop size={16} /> },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('modals.settings.title')} size="lg">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Theme</label>
          <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
            {themeOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleThemeChange(opt.value as any)}
                className={`flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  localSettings.theme === opt.value
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:bg-white/50 dark:text-slate-300 dark:hover:bg-slate-700/50'
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Input
            label={t('modals.settings.geminiApiKey')}
            name="apiKey"
            type="password"
            value={localSettings.apiKey || ''}
            onChange={handleChange}
            placeholder={t('modals.settings.geminiApiKeyPlaceholder')}
          />
          <div className="flex items-center justify-end gap-4 min-h-[36px]">
            <VerificationStatusIndicator status={verificationStatus} t={t} />
            <Button variant="secondary" size="sm" onClick={handleVerify} isLoading={verificationStatus === 'verifying'}>
              {t('modals.settings.verifyConnection')}
            </Button>
          </div>
        </div>
        
        <Input
          label={t('modals.settings.teacherName')}
          name="teacherName"
          value={localSettings.teacherName || ''}
          onChange={handleChange}
        />
        <Input
          label={t('modals.settings.schoolId')}
          name="schoolId"
          value={localSettings.schoolId || ''}
          onChange={handleChange}
        />
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2"><Image size={16}/>{t('modals.settings.autoAnalyzeImages')}</label>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{t('modals.settings.autoAnalyzeImagesHint')}</p>
            </div>
            <div className="flex items-center">
              <label className="inline-flex items-center cursor-pointer select-none">
                <input type="checkbox" className="sr-only" checked={!!localSettings.autoAnalyzeImages} onChange={handleToggleAutoAnalyze} />
                <span className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${localSettings.autoAnalyzeImages ? 'bg-green-500' : 'bg-slate-400 dark:bg-slate-600'}`}>
                  <span className={`bg-white w-4 h-4 rounded-full shadow transition-transform ${localSettings.autoAnalyzeImages ? 'translate-x-5' : ''}`}></span>
                </span>
              </label>
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('modals.settings.language')}</label>
          <select
            id="language"
            name="language"
            value={localSettings.language}
            onChange={handleChange}
            className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </div>
      </div>
      <div className="mt-8 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>
            <X size={16} className="mr-2" />
            {t('actions.cancel')}
        </Button>
        <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
            <Save size={16} className="mr-2" />
            {t('modals.settings.save')}
        </Button>
      </div>
    </Modal>
  );
};

export default SettingsModal;
