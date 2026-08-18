'use client';

import React, { useState, useEffect, useRef } from 'react';
import { EditFieldModal, EditFieldOption } from './EditFieldModal';
import { Edit2, ChevronDown, Check, Search, Loader2 } from 'lucide-react';

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom');
  const [alignment, setAlignment] = useState<'left' | 'right'>('left');
  const [menuMaxHeight, setMenuMaxHeight] = useState<number>(260);
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const updatePosition = () => {
    if (!selectRef.current) return;
    const rect = selectRef.current.getBoundingClientRect();
    
    const container = selectRef.current.closest('.account-pane-fields') as HTMLElement | null;
    const containerRect = container ? container.getBoundingClientRect() : null;

    const visibleBottom = containerRect 
      ? Math.min(window.innerHeight - 16, containerRect.bottom - 12)
      : window.innerHeight - 16;

    const visibleTop = containerRect
      ? Math.max(16, containerRect.top + 12)
      : 16;

    const spaceBelow = visibleBottom - rect.bottom;
    const spaceAbove = rect.top - visibleTop;

    if (spaceBelow < 220 && spaceAbove > spaceBelow) {
      setPlacement('top');
      setMenuMaxHeight(Math.max(120, Math.min(spaceAbove - 16, 280)));
    } else {
      setPlacement('bottom');
      setMenuMaxHeight(Math.max(120, Math.min(spaceBelow - 16, 280)));
    }

    if (rect.left + 320 > window.innerWidth && rect.right >= 300) {
      setAlignment('right');
    } else {
      setAlignment('left');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchQuery('');
      }
    };
    if (isDropdownOpen) {
      updatePosition();
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isDropdownOpen]);

  const filteredOptions = options.filter((opt) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const labelMatch = opt.label.toLowerCase().includes(query);
    const descMatch = opt.description ? opt.description.toLowerCase().includes(query) : false;
    return labelMatch || descMatch;
  });

  const handleSelectOption = async (optionValue: string | number) => {
    setIsDropdownOpen(false);
    setSearchQuery('');
    if (String(optionValue) === String(value)) return;
    if (onSave) {
      setIsSaving(true);
      try {
        await onSave(String(optionValue));
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2000);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        updatePosition();
        setIsDropdownOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsDropdownOpen(false);
      setSearchQuery('');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1 < filteredOptions.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredOptions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        handleSelectOption(filteredOptions[highlightedIndex].value);
      }
    }
  };

  const displayValue = () => {
    if (value === null || value === undefined || value === '') {
      return <span className="placeholder">{placeholder}</span>;
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
        return <span className="placeholder">{placeholder}</span>;
      }

      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
          {tags.map((tag: string, index: number) => (
            <span
              key={index}
              style={{
                fontSize: '11.5px',
                fontFamily: 'var(--font-mono)',
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'var(--color-surface-raised)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-ink)',
                fontWeight: 600,
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

  const isDirectSelect = type === 'select' && options.length > 0 && Boolean(onSave) && !isLocked;
  const currentOption = options.find((opt) => String(opt.value) === String(value));
  const currentLabel = currentOption ? currentOption.label : (value ? String(value) : placeholder);
  const optionsMaxHeight = Math.max(70, menuMaxHeight - (options.length > 5 ? 54 : 14));

  return (
    <>
      <div className={`account-field-row ${isLocked ? 'locked' : ''}`}>
        <div className="account-field-info">
          <div className="account-field-label">{label}</div>
          
          {isDirectSelect ? (
            <div className="account-custom-select-container" ref={selectRef}>
              <button
                type="button"
                className="account-custom-select-trigger"
                onClick={() => {
                  updatePosition();
                  setIsDropdownOpen(!isDropdownOpen);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                disabled={isLocked || isSaving}
                aria-expanded={isDropdownOpen}
              >
                <span>{currentLabel}</span>
                {isSaving ? (
                  <Loader2 size={14} className="spin" color="var(--color-primary)" />
                ) : justSaved ? (
                  <span className="account-field-saved-indicator">
                    <Check size={13} />
                    <span>Saved</span>
                  </span>
                ) : (
                  <ChevronDown size={14} className={`custom-select-chevron ${isDropdownOpen ? 'open' : ''}`} />
                )}
              </button>

              {isDropdownOpen && (
                <div 
                  className={`account-custom-select-menu placement-${placement} align-${alignment}`}
                  style={{ maxHeight: `${menuMaxHeight}px` }}
                >
                  {options.length > 5 && (
                    <div className="account-custom-select-search">
                      <Search size={13} color="var(--color-ink-muted)" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        className="account-custom-select-search-input"
                        placeholder={`Search ${label.toLowerCase()}...`}
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setHighlightedIndex(0);
                        }}
                        onKeyDown={handleKeyDown}
                      />
                    </div>
                  )}

                  <div 
                    className="account-custom-select-options"
                    style={{ maxHeight: `${optionsMaxHeight}px` }}
                  >
                    {filteredOptions.length > 0 ? (
                      filteredOptions.map((opt, idx) => {
                        const isSelected = String(opt.value) === String(value);
                        const isHighlighted = idx === highlightedIndex;
                        return (
                          <button
                            key={String(opt.value)}
                            type="button"
                            className={`account-custom-select-item ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
                            onClick={() => handleSelectOption(opt.value)}
                            onMouseEnter={() => setHighlightedIndex(idx)}
                          >
                            <div style={{ flex: 1 }}>
                              <div className="account-custom-select-item-label">{opt.label}</div>
                              {opt.description && (
                                <div className="account-custom-select-item-desc">{opt.description}</div>
                              )}
                            </div>
                            {isSelected && <Check size={14} color="var(--color-primary)" strokeWidth={2.5} />}
                          </button>
                        );
                      })
                    ) : (
                      <div className="account-custom-select-empty">
                        No matching options found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="account-field-display-value">
              {displayValue()}
            </div>
          )}

          {helperText && (
            <div className="account-field-helper">
              {helperText}
            </div>
          )}
        </div>

        {!isDirectSelect && !isLocked && onSave && (
          <button
            type="button"
            className="account-field-edit-action"
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            <Edit2 size={13} strokeWidth={2} />
            <span>Edit</span>
          </button>
        )}
      </div>

      {!isDirectSelect && isModalOpen && onSave && (
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
