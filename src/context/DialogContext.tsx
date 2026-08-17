import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AppDialog, DialogVariant, DialogType } from '../components/AppDialog';

export interface DialogOptions {
  title: string;
  message: ReactNode;
  eyebrow?: string;
  variant?: DialogVariant;
  confirmText?: string;
  cancelText?: string;
  placeholder?: string;
  defaultValue?: string;
}

export interface DialogContextType {
  confirm: (options: DialogOptions) => Promise<boolean>;
  alert: (options: Omit<DialogOptions, 'cancelText'>) => Promise<void>;
  prompt: (options: DialogOptions) => Promise<string | null>;
}

const DialogContext = createContext<DialogContextType | null>(null);

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogType, setDialogType] = useState<DialogType>('confirm');
  const [options, setOptions] = useState<DialogOptions>({
    title: '',
    message: '',
  });
  const [inputValue, setInputValue] = useState('');
  const [resolver, setResolver] = useState<{
    resolve: (value: any) => void;
  } | null>(null);

  const confirm = useCallback((opts: DialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts);
      setDialogType('confirm');
      setInputValue('');
      setResolver({ resolve });
      setIsOpen(true);
    });
  }, []);

  const alert = useCallback((opts: Omit<DialogOptions, 'cancelText'>): Promise<void> => {
    return new Promise((resolve) => {
      setOptions(opts);
      setDialogType('alert');
      setInputValue('');
      setResolver({ resolve });
      setIsOpen(true);
    });
  }, []);

  const prompt = useCallback((opts: DialogOptions): Promise<string | null> => {
    return new Promise((resolve) => {
      setOptions(opts);
      setDialogType('prompt');
      setInputValue(opts.defaultValue || '');
      setResolver({ resolve });
      setIsOpen(true);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolver) {
      if (dialogType === 'prompt') {
        resolver.resolve(inputValue);
      } else if (dialogType === 'confirm') {
        resolver.resolve(true);
      } else {
        resolver.resolve(undefined);
      }
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolver) {
      if (dialogType === 'prompt') {
        resolver.resolve(null);
      } else if (dialogType === 'confirm') {
        resolver.resolve(false);
      } else {
        resolver.resolve(undefined);
      }
    }
  };

  return (
    <DialogContext.Provider value={{ confirm, alert, prompt }}>
      {children}
      <AppDialog
        isOpen={isOpen}
        type={dialogType}
        variant={options.variant}
        eyebrow={options.eyebrow}
        title={options.title}
        message={options.message}
        placeholder={options.placeholder}
        inputValue={inputValue}
        onInputChange={setInputValue}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </DialogContext.Provider>
  );
};

export const useDialog = (): DialogContextType => {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return ctx;
};
