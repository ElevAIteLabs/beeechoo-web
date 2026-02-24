// src/components/ui/FancyDropdown.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export type FancyDropdownOption = {
  value: string;
  label: string;
  description?: string;
};

type FancyDropdownProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: FancyDropdownOption[];
  className?: string;
};

export const FancyDropdown: React.FC<FancyDropdownProps> = ({
  label,
  value,
  onChange,
  options,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const selectedOption =
    options.find(opt => opt.value === value) || options[0] || null;

  const handleSelect = (opt: FancyDropdownOption) => {
    onChange(opt.value);
    setIsOpen(false);
  };

  // close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`ev-dd ${className}`} ref={ref}>
      {label && (
        <label className="ev-dd-label">
          {label}
        </label>
      )}

      {/* Trigger button */}
      <button
        type="button"
        className="ev-dd-btn"
        onClick={() => setIsOpen(prev => !prev)}
      >
        <span className="ev-dd-btn-label">
          {selectedOption?.label ?? 'Select'}
        </span>
        <span className={`ev-dd-icon ${isOpen ? 'ev-dd-icon-open' : ''}`}>
          <ChevronDown size={16} />
        </span>
      </button>

      {/* Menu */}
      {isOpen && (
        <div className="ev-dd-menu">
          {options.map((opt, index) => {
            const isSelected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                className={`ev-dd-option ${
                  isSelected ? 'ev-dd-option-active' : ''
                } ${
                  index !== options.length - 1 ? 'ev-dd-option-border' : ''
                }`}
                onClick={() => handleSelect(opt)}
              >
                <div className="ev-dd-option-text">
                  <span className="ev-dd-option-label">{opt.label}</span>
                  {opt.description && (
                    <span className="ev-dd-option-desc">
                      {opt.description}
                    </span>
                  )}
                </div>
                {isSelected && (
                  <span className="ev-dd-check">
                    <Check size={16} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
