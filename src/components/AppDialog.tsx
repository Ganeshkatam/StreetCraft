import React, { useEffect, useRef } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  HelpCircle,
  X,
} from 'lucide-react';

export type DialogVariant = 'default' | 'danger' | 'warning' | 'info' | 'success';
export type DialogType = 'alert' | 'confirm' | 'prompt';

export interface AppDialogProps {
  isOpen: boolean;
  type?: DialogType;
  variant?: DialogVariant;
  eyebrow?: string;
  title: string;
  message: React.ReactNode;
  placeholder?: string;
  defaultValue?: string;
  inputValue?: string;
  onInputChange?: (val: string) => void;
  confirmText?: string;
  cancelText?: string;
  isProcessing?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  closeOnBackdrop?: boolean;
}

export const AppDialog: React.FC<AppDialogProps> = ({
  isOpen,
  type = 'confirm',
  variant = 'default',
  eyebrow,
  title,
  message,
  placeholder,
  inputValue = '',
  onInputChange,
  confirmText = 'Continue',
  cancelText = 'Cancel',
  isProcessing = false,
  onConfirm,
  onCancel,
  closeOnBackdrop = true,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && onCancel && !isProcessing) {
          onCancel();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      // Auto-focus input or confirm button
      setTimeout(() => {
        if (type === 'prompt' && inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        } else if (confirmBtnRef.current) {
          confirmBtnRef.current.focus();
        }
      }, 50);

      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onCancel, isProcessing, type]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertTriangle size={20} color="#b91c1c" />,
          iconBg: 'rgba(239, 68, 68, 0.12)',
          iconBorder: 'rgba(239, 68, 68, 0.25)',
          confirmBtnBg: '#b91c1c',
          confirmBtnBorder: '#b91c1c',
          confirmBtnColor: '#ffffff',
          defaultEyebrow: 'DESTRUCTIVE ACTION',
        };
      case 'warning':
        return {
          icon: <AlertCircle size={20} color="#d97706" />,
          iconBg: 'rgba(245, 158, 11, 0.12)',
          iconBorder: 'rgba(245, 158, 11, 0.25)',
          confirmBtnBg: '#d97706',
          confirmBtnBorder: '#d97706',
          confirmBtnColor: '#ffffff',
          defaultEyebrow: 'ATTENTION REQUIRED',
        };
      case 'info':
        return {
          icon: <Info size={20} color="var(--color-accent)" />,
          iconBg: 'var(--color-accent-subtle, rgba(42, 67, 101, 0.1))',
          iconBorder: 'var(--color-accent-border, rgba(42, 67, 101, 0.25))',
          confirmBtnBg: 'var(--color-primary)',
          confirmBtnBorder: 'var(--color-primary)',
          confirmBtnColor: '#ffffff',
          defaultEyebrow: 'SYSTEM NOTICE',
        };
      case 'success':
        return {
          icon: <CheckCircle2 size={20} color="#15803d" />,
          iconBg: 'rgba(34, 197, 94, 0.12)',
          iconBorder: 'rgba(34, 197, 94, 0.25)',
          confirmBtnBg: '#15803d',
          confirmBtnBorder: '#15803d',
          confirmBtnColor: '#ffffff',
          defaultEyebrow: 'OPERATION CONFIRMED',
        };
      default:
        return {
          icon: type === 'prompt' ? <HelpCircle size={20} color="var(--color-primary)" /> : <Info size={20} color="var(--color-primary)" />,
          iconBg: 'var(--color-primary-subtle)',
          iconBorder: 'var(--color-primary-border)',
          confirmBtnBg: 'var(--color-primary)',
          confirmBtnBorder: 'var(--color-primary)',
          confirmBtnColor: 'var(--color-primary-text, #ffffff)',
          defaultEyebrow: 'CONFIRMATION',
        };
    }
  };

  const vStyles = getVariantStyles();

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdrop && onCancel && !isProcessing) {
      onCancel();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isProcessing) {
      onConfirm();
    }
  };

  return (
    <div className="app-dialog-overlay" onClick={handleBackdropClick} role="dialog" aria-modal="true">
      <div className="app-dialog-card" onClick={(e) => e.stopPropagation()}>
        {/* Top Header with Icon & Eyebrow */}
        <div className="app-dialog-header">
          <div className="app-dialog-icon-wrapper" style={{ background: vStyles.iconBg, borderColor: vStyles.iconBorder }}>
            {vStyles.icon}
          </div>
          <div className="app-dialog-header-text">
            <span className="app-dialog-eyebrow">
              {eyebrow || vStyles.defaultEyebrow}
            </span>
            <h3 className="app-dialog-title">{title}</h3>
          </div>
          {onCancel && !isProcessing && (
            <button
              type="button"
              className="app-dialog-close-btn"
              onClick={onCancel}
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Dialog Content */}
        <form onSubmit={handleFormSubmit}>
          <div className="app-dialog-body">
            {typeof message === 'string' ? (
              <p className="app-dialog-message">{message}</p>
            ) : (
              message
            )}

            {/* Prompt Input Field */}
            {type === 'prompt' && (
              <div className="app-dialog-input-group">
                <input
                  ref={inputRef}
                  type="text"
                  className="app-dialog-input"
                  placeholder={placeholder}
                  value={inputValue}
                  onChange={(e) => onInputChange && onInputChange(e.target.value)}
                  disabled={isProcessing}
                  required
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="app-dialog-actions">
            {type !== 'alert' && onCancel && (
              <button
                type="button"
                className="btn-secondary app-dialog-cancel-btn"
                onClick={onCancel}
                disabled={isProcessing}
              >
                {cancelText}
              </button>
            )}
            <button
              ref={confirmBtnRef}
              type="submit"
              className="btn-primary app-dialog-confirm-btn"
              style={{
                backgroundColor: vStyles.confirmBtnBg,
                borderColor: vStyles.confirmBtnBorder,
                color: vStyles.confirmBtnColor,
              }}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
