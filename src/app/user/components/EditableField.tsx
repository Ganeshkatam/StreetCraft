'use client';

import React, { useState } from 'react';
import { EditFieldModal, EditFieldOption } from './EditFieldModal';
import { Edit2 } from 'lucide-react';

export interface EditableFieldProps {
  label: string;
  value: string | number | null | undefined;
  type?: 'text' | 'tel' | 'number' | 'textarea' | 'select' | 'tags';
  options?: EditFieldOption[];
  placeholder?: string;
  helperText?: string;
  isLocked?: boolean;
  onSave?: (val: string) => Promise<{ success: boolean; error?: string } | void>;
  suffix?: string;
  prefix?: string;
}

export function EditableField({
  label,
  value,
  type = 'text',
  options = [],
  placeholder = 'Not set',
  helperText,
  isLocked = false,
  onSave,
  suffix,
  prefix,
}: EditableFieldProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const displayValue = () => {
    if (value === null || value === undefined || value === '') {
      return <span style={{ color: 'var(--color-ink-muted)', fontStyle: 'italic' }}>{placeholder}</span>;
    }

    if (type === 'select' && options.length > 0) {
      const selectedOption = options.find((opt) => String(opt.value) === String(value));
      return selectedOption ? selectedOption.label : String(value);
    }

    if (type === 'tags') {
      const tags = Array.isArray(value)
        ? value
        : String(value)
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);

      if (tags.length === 0) {
        return <span style={{ color: 'var(--color-ink-muted)', fontStyle: 'italic' }}>{placeholder}</span>;
      }

      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
          {tags.map((tag: string, index: number) => (
            <span
              key={index}
              style={{
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'var(--color-surface-raised)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-ink-soft)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      );
    }

    return `${prefix || ''}${value}${suffix || ''}`;
  };

  const modalType: 'text' | 'tel' | 'number' | 'textarea' =
    type === 'tel' || type === 'number' || type === 'textarea' ? type : 'text';

  return (
    <>
      <div className="account-field-row">
        <div className="account-field-label">{label.toUpperCase()}</div>

        <div className="account-field-content-row">
          <div style={{ fontSize: '14.5px', color: 'var(--color-ink)', fontWeight: 500 }}>
            {displayValue()}
            {helperText && (
              <div style={{ fontSize: '12px', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
                {helperText}
              </div>
            )}
          </div>

          {!isLocked && onSave && (
            <button
              type="button"
              className="btn-ghost"
              style={{ fontSize: '12px', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              onClick={() => setIsModalOpen(true)}
            >
              <Edit2 size={12} />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>

      {isModalOpen && onSave && (
        <EditFieldModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Edit ${label}`}
          label={label}
          initialValue={value !== null && value !== undefined ? String(value) : ''}
          type={modalType}
          options={options}
          helperText={helperText}
          onSave={async (val) => {
            const res = await onSave(val);
            if (res && !res.success) {
              return res;
            }
            setIsModalOpen(false);
            return { success: true };
          }}
        />
      )}
    </>
  );
}
