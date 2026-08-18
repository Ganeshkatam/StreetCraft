'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
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

  return (
    <>
      <div className="account-field-row">
        <div className="account-field-meta-label">
          {label.toUpperCase()}
        </div>

        <div className="account-field-content-row">
          <div className={`account-field-display-value ${value ? '' : 'placeholder'}`}>
            {value || placeholder || 'Not provided'}
          </div>

          <div className="account-field-action-box">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="account-field-edit-action"
              title={`Edit ${label}`}
            >
              <span>Edit</span>
              <ChevronRight size={14} />
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
        options={options}
        helperText={helperText}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
      />
    </>
  );
};
