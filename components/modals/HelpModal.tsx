
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
        {/* Getting started */}
        <HelpSection icon={<Info size={24} />} title={t('modals.help.gettingStartedTitle')}>
          <ul className="list-disc ml-6">
            <li>{t('modals.help.gettingStarted1')}</li>
            <li>{t('modals.help.gettingStarted2')}</li>
            <li>{t('modals.help.gettingStarted3')}</li>
          </ul>
        </HelpSection>

        {/* Workflow */}
        <HelpSection icon={<Info size={24} />} title={t('modals.help.workflowTitle')}>
          <ol className="list-decimal ml-6">
            <li>{t('modals.help.workflow1')}</li>
            <li>{t('modals.help.workflow2')}</li>
            <li>{t('modals.help.workflow3')}</li>
          </ol>
        </HelpSection>

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
          <div className="mt-2">
            <h4 className="font-medium text-slate-800 dark:text-slate-100">{t('modals.help.aiStepsTitle')}</h4>
            <ol className="list-decimal ml-6 space-y-1 mt-1">
              <li>{t('modals.help.aiStep1')}</li>
              <li>{t('modals.help.aiStep2')}</li>
              <li>{t('modals.help.aiStep3')}</li>
              <li>{t('modals.help.aiStep4')}</li>
              <li>{t('modals.help.aiStep5')}</li>
            </ol>
            <h4 className="font-medium text-slate-800 dark:text-slate-100 mt-3">{t('modals.help.aiTipsTitle')}</h4>
            <ul className="list-disc ml-6 space-y-1 mt-1">
              <li>{t('modals.help.aiTip1')}</li>
              <li>{t('modals.help.aiTip2')}</li>
              <li>{t('modals.help.aiTip3')}</li>
            </ul>
          </div>
        </HelpSection>

        {/* Export tips */}
        <HelpSection icon={<Info size={24} />} title={t('modals.help.exportTitle')}>
          <ul className="list-disc ml-6 space-y-1">
            <li>{t('modals.help.exportTip1')}</li>
            <li>{t('modals.help.exportTip2')}</li>
            <li>{t('modals.help.exportTip3')}</li>
          </ul>
        </HelpSection>

        {/* Settings help */}
        <HelpSection icon={<Info size={24} />} title={t('modals.help.settingsHelpTitle')}>
          <ul className="list-disc ml-6 space-y-1">
            <li>{t('modals.help.settingsHelp1')}</li>
            <li>{t('modals.help.settingsHelp2')}</li>
          </ul>
        </HelpSection>

        {/* Shortcuts */}
        <HelpSection icon={<Info size={24} />} title={t('modals.help.shortcutsTitle')}>
          <ul className="list-disc ml-6 space-y-1">
            <li>{t('modals.help.shortcut1')}</li>
            <li>{t('modals.help.shortcut2')}</li>
            <li>{t('modals.help.shortcut3')}</li>
          </ul>
        </HelpSection>

        {/* Troubleshooting */}
        <HelpSection icon={<Info size={24} />} title={t('modals.help.troubleshootTitle')}>
          <ul className="list-disc ml-6 space-y-1">
            <li>{t('modals.help.trouble1')}</li>
            <li>{t('modals.help.trouble2')}</li>
            <li>{t('modals.help.trouble3')}</li>
            <li>{t('modals.help.trouble4')}</li>
            <li>{t('modals.help.trouble5')}</li>
          </ul>
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