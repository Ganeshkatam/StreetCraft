'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Loader2, ChevronDown, Check, PenLine } from 'lucide-react';
import { toast } from 'sonner';
import { EditFieldModal, EditFieldOption } from '../../components/EditFieldModal';

interface EditableAccountFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  type?: 'text' | 'tel' | 'number' | 'textarea';
  options?: EditFieldOption[];
  helperText?: string;
  onSave: (newValue: string) => Promise<{ success: boolean; error?: string }>;
}

export const EditableAccountField: React.FC<EditableAccountFieldProps> = ({
  label,
  value,
  placeholder,
  type = 'text',
  options,
  helperText,
  onSave,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dynamic positioning calculation based on viewport clearance
  useEffect(() => {
    if (isDropdownOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < 300 && spaceAbove > spaceBelow) {
        setOpenUpwards(true);
      } else {
        setOpenUpwards(false);
      }
    }
  }, [isDropdownOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Close dropdown on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const handleModalSave = async (newValue: string): Promise<{ success: boolean; error?: string }> => {
    const result = await onSave(newValue);
    if (result.success) {
      toast.success(`${label} updated`);
      return { success: true };
    } else {
      const err = result.error || `Failed to update ${label}`;
      toast.error(err);
      return { success: false, error: err };
    }
  };

  const handleSelectOption = async (selected: string) => {
    setIsDropdownOpen(false);
    if (selected === value) return;

    setIsSaving(true);
    const result = await onSave(selected);
    setIsSaving(false);

    if (result.success) {
      toast.success(`${label} updated`);
    } else {
      const err = result.error || `Failed to update ${label}`;
      toast.error(err);
    }
  };

  const handleOpenCustomModal = () => {
    setIsDropdownOpen(false);
    setIsModalOpen(true);
  };

  // 1. Option Fields: Render Custom Dropdown Popover (No native OS select)
  if (options && options.length > 0) {
    const isCustomValue = Boolean(
      value && !options.some((opt) => opt.value.toLowerCase() === value.trim().toLowerCase())
    );

    const selectedOption = options.find(
      (opt) => opt.value.toLowerCase() === (value || '').trim().toLowerCase()
    );

    const displayTitle = isCustomValue
      ? value
      : selectedOption?.label || value || placeholder || 'Select...';

    return (
      <>
        <div className="account-field-row">
          <div className="account-field-content-row">
            <div className="account-field-info">
              <div className="account-field-label">{label}</div>
              <div className={`account-field-display-value ${value ? '' : 'placeholder'}`}>
                {value || placeholder || 'Not selected'}
              </div>
            </div>

            <div className="account-field-select-wrapper" ref={dropdownRef}>
              {isSaving ? (
                <div className="account-field-select-loading">
                  <Loader2 size={15} className="spin" />
                </div>
              ) : (
                <div className="account-custom-dropdown-container">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`account-custom-dropdown-trigger ${isDropdownOpen ? 'active' : ''}`}
                    aria-haspopup="listbox"
                    aria-expanded={isDropdownOpen}
                  >
                    <span className="account-dropdown-trigger-text">{displayTitle}</span>
                    <ChevronDown size={14} className={`account-dropdown-chevron ${isDropdownOpen ? 'open' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className={`account-custom-dropdown-popover ${openUpwards ? 'open-upwards' : ''}`} role="listbox">
                      <div className="account-custom-dropdown-list">
                        {options.map((opt) => {
                          const isSelected = !isCustomValue && value?.toLowerCase() === opt.value.toLowerCase();
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleSelectOption(opt.value)}
                              className={`account-custom-dropdown-item ${isSelected ? 'selected' : ''}`}
                              role="option"
                              aria-selected={isSelected}
                            >
                              <div className="account-dropdown-item-info">
                                <div className="account-dropdown-item-label">{opt.label || opt.value}</div>
                                {opt.description && (
                                  <div className="account-dropdown-item-desc">{opt.description}</div>
                                )}
                              </div>
                              {isSelected && (
                                <div className="account-dropdown-item-check">
                                  <Check size={14} />
                                </div>
                              )}
                            </button>
                          );
                        })}

                        <div className="account-dropdown-divider" />

                        <button
                          type="button"
                          onClick={handleOpenCustomModal}
                          className={`account-custom-dropdown-item custom-item ${isCustomValue ? 'selected' : ''}`}
                        >
                          <div className="account-dropdown-item-info">
                            <div className="account-dropdown-item-label custom-label">
                              <PenLine size={13} className="inline-icon" />
                              <span>Custom / Write your own...</span>
                            </div>
                            <div className="account-dropdown-item-desc">
                              {isCustomValue ? `Current: "${value}"` : 'Enter custom wording'}
                            </div>
                          </div>
                          {isCustomValue && (
                            <div className="account-dropdown-item-check">
                              <Check size={14} />
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="account-field-row-divider" />
        </div>

        {/* Modal opened only when custom option is selected */}
        <EditFieldModal
          isOpen={isModalOpen}
          title={`Custom ${label}`}
          label={`Custom ${label}`}
          initialValue={isCustomValue ? value : ''}
          placeholder={`Enter custom ${label.toLowerCase()}...`}
          type={type}
          helperText={helperText}
          onClose={() => setIsModalOpen(false)}
          onSave={handleModalSave}
        />
      </>
    );
  }

  // 2. Input Fields: Render [ Edit ] button which opens Edit Modal
  return (
    <>
      <div className="account-field-row">
        <div className="account-field-content-row">
          <div className="account-field-info">
            <div className="account-field-label">{label}</div>
            <div className={`account-field-display-value ${value ? '' : 'placeholder'}`}>
              {value || placeholder || 'Not provided'}
            </div>
          </div>

          <div className="account-field-action-box">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="account-field-edit-action"
              title={`Edit ${label}`}
            >
              Edit
            </button>
          </div>
        </div>

        <div className="account-field-row-divider" />
      </div>

      <EditFieldModal
        isOpen={isModalOpen}
        title={`Edit ${label}`}
        label={label}
        initialValue={value || ''}
        placeholder={placeholder}
        type={type}
        helperText={helperText}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
      />
    </>
  );
};
