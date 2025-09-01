
import React from 'react';
import { useSettings } from '../../hooks/useSettings';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Info, Mail, XCircle, Pencil, CodeXml, Sparkles } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpSection: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="flex items-start gap-4">
    <div className="flex-shrink-0 w-6 h-6 text-slate-500 dark:text-slate-400 mt-1">{icon}</div>
    <div>
      <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">{title}</h3>
      <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 space-y-2">
        {children}
      </div>
    </div>
  </div>
);


const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    const {t} = useSettings();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('modals.help.title')}>
      <div className="space-y-6">

        <HelpSection icon={<Pencil size={24} />} title={t('modals.help.editingTitle')}>
            <p>{t('modals.help.editingText')}</p>
        </HelpSection>
        
        <HelpSection icon={<CodeXml size={24} />} title={t('modals.help.syntaxTitle')}>
            <p>{t('modals.help.syntaxText')}</p>
            <div className="space-y-2 pt-2">
                <p className="text-sm">{t('modals.help.inlineMath')}</p>
                <code className="block text-xs bg-slate-100 dark:bg-slate-800 rounded p-2 font-mono text-slate-800 dark:text-slate-200">
                    {'\\(x^2 + y^2 = r^2\\)'}
                </code>
                <p className="text-sm pt-2">{t('modals.help.displayMath')}</p>
                <code className="block text-xs bg-slate-100 dark:bg-slate-800 rounded p-2 font-mono text-slate-800 dark:text-slate-200">
                    {'\\(\\sum_{i=1}^n i = \\frac{n(n+1)}{2}\\)'}
                </code>
            </div>
        </HelpSection>

        <HelpSection icon={<Sparkles size={24} />} title={t('modals.help.aiTitle')}>
            <p>{t('modals.help.aiText')}</p>
        </HelpSection>
        
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700" />
        
        <HelpSection icon={<Info size={24} />} title={t('modals.help.about')}>
            <p>{t('modals.help.aboutText')}</p>
        </HelpSection>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-700" />

        <HelpSection icon={<Sparkles size={24} />} title={t('modals.help.creditsTitle')}>
            <p>
                {t('modals.help.creditsText')}
            </p>
            <p className="flex items-center gap-2 mt-2">
                <Mail size={16} />
                <a href="mailto:bdh.malek@gmail.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    bdh.malek@gmail.com
                </a>
            </p>
        </HelpSection>
        
        
      </div>
      <div className="mt-8 flex justify-end">
        <Button variant="secondary" onClick={onClose}>
            <XCircle size={16} className="mr-2"/>
            {t('actions.close')}
        </Button>
      </div>
    </Modal>
  );
};

export default HelpModal;