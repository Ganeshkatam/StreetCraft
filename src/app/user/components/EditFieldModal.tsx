'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Check, PenLine } from 'lucide-react';

export interface EditFieldOption {
  value: string;
  label: string;
  description?: string;
}

interface EditFieldModalProps {
  isOpen: boolean;
  title: string;
  label: string;
  initialValue: string;
  placeholder?: string;
  type?: 'text' | 'tel' | 'number' | 'textarea';
  options?: EditFieldOption[];
  helperText?: string;
  onClose: () => void;
  onSave: (newValue: string) => Promise<{ success: boolean; error?: string }>;
}

export const EditFieldModal: React.FC<EditFieldModalProps> = ({
  isOpen,
  title,
  label,
  initialValue,
  placeholder,
  type = 'text',
  options,
  helperText,
  onClose,
  onSave,
}) => {
  const [value, setValue] = useState(initialValue);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customText, setCustomText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
      setErrorMessage(null);

      if (options && options.length > 0) {
        const matchesPreset = options.some(
          (opt) => opt.value.toLowerCase() === initialValue.trim().toLowerCase()
        );
        if (!matchesPreset && initialValue.trim().length > 0) {
          setIsCustomMode(true);
          setCustomText(initialValue);
        } else {
          setIsCustomMode(false);
          setCustomText('');
        }
      }

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const len = inputRef.current.value.length;
          inputRef.current.setSelectionRange(len, len);
        }
      }, 50);
    }
  }, [isOpen, initialValue, options]);

  if (!isOpen) return null;

  const handleSelectOption = (optValue: string) => {
    setIsCustomMode(false);
    setValue(optValue);
  };

  const handleActivateCustom = () => {
    setIsCustomMode(true);
    const initialCustom = customText || value || '';
    setCustomText(initialCustom);
    setValue(initialCustom);
    setTimeout(() => {
      customInputRef.current?.focus();
    }, 50);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomText(e.target.value);
    setValue(e.target.value);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalValue = isCustomMode ? customText.trim() : value.trim();

    if (finalValue === initialValue.trim()) {
      onClose();
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const result = await onSave(finalValue);
    setIsSaving(false);

    if (result.success) {
      onClose();
    } else {
      setErrorMessage(result.error || 'Failed to update field.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Enter' && type !== 'textarea') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={`edit-field-modal-card ${options ? 'has-options' : ''}`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="edit-modal-header">
          <h2 className="edit-modal-title">{title}</h2>
        </div>

        <form onSubmit={handleSave} className="edit-modal-body">
          <div className="edit-modal-field-group">
            <label className="edit-modal-label">
              {label}
            </label>

            {options && options.length > 0 ? (
              <div className="edit-modal-options-wrapper">
                <div className="edit-modal-options-list">
                  {options.map((opt) => {
                    const isSelected = !isCustomMode && value.toLowerCase() === opt.value.toLowerCase();
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelectOption(opt.value)}
                        className={`edit-modal-option-card ${isSelected ? 'selected' : ''}`}
                      >
                        <div className="edit-modal-option-info">
                          <div className="edit-modal-option-name">{opt.label || opt.value}</div>
                          {opt.description && (
                            <div className="edit-modal-option-desc">{opt.description}</div>
                          )}
                        </div>
                        <div className="edit-modal-option-check">
                          {isSelected && <Check size={16} />}
                        </div>
                      </button>
                    );
                  })}

                  {/* Custom Option Card */}
                  <button
                    type="button"
                    onClick={handleActivateCustom}
                    className={`edit-modal-option-card custom-option ${isCustomMode ? 'selected' : ''}`}
                  >
                    <div className="edit-modal-option-info">
                      <div className="edit-modal-option-name">
                        <PenLine size={14} className="inline-icon" />
                        <span>Custom / Write your own</span>
                      </div>
                      <div className="edit-modal-option-desc">
                        Type your own custom description for this parameter
                      </div>
                    </div>
                    <div className="edit-modal-option-check">
                      {isCustomMode && <Check size={16} />}
                    </div>
                  </button>
                </div>

                {isCustomMode && (
                  <div className="edit-modal-custom-input-box">
                    <label className="edit-modal-sublabel">YOUR CUSTOM VALUE</label>
                    <input
                      ref={customInputRef}
                      type="text"
                      value={customText}
                      onChange={handleCustomChange}
                      placeholder={placeholder || `Enter custom ${label.toLowerCase()}...`}
                      className="edit-modal-input"
                      disabled={isSaving}
                    />
                  </div>
                )}
              </div>
            ) : type === 'textarea' ? (
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                rows={4}
                className="edit-modal-textarea"
                disabled={isSaving}
              />
            ) : (
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type={type}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="edit-modal-input"
                disabled={isSaving}
              />
            )}

            {helperText && (
              <div className="edit-modal-help-text">
                {helperText}
              </div>
            )}

            {errorMessage && (
              <div className="edit-modal-error-message">
                {errorMessage}
              </div>
            )}
          </div>

          <div className="edit-modal-footer">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="edit-modal-cancel-btn"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="edit-modal-done-btn"
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
