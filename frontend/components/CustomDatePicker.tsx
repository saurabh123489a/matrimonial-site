'use client';

import React, { useState, useRef, useEffect, memo } from 'react';

interface CustomDatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  required?: boolean;
  min?: string;
  max?: string;
}

function CustomDatePicker({
  label,
  error,
  required,
  min,
  max,
  className = '',
  value,
  onChange,
  ...props
}: CustomDatePickerProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Format date for display
  const formatDisplayDate = (dateString: string | undefined): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const displayValue = value ? formatDisplayDate(value as string) : '';

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={props.id} 
          className="block text-xs sm:text-sm font-semibold text-gray-700"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {/* Calendar Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none z-10">
          <svg 
            className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-200 ${
              isFocused || value
                ? 'text-pink-500' 
                : 'text-gray-400'
            }`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>

        {/* Hidden Native Date Input */}
        <input
          {...props}
          ref={inputRef}
          type="date"
          min={min}
          max={max}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 touch-target"
        />

        {/* Custom Styled Display */}
        <div
          onClick={() => inputRef.current?.showPicker?.() || inputRef.current?.focus()}
          className={`
            block w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 
            border-2 rounded-lg sm:rounded-xl 
            transition-all duration-200 
            cursor-pointer touch-target
            bg-white
            text-sm sm:text-base
            text-gray-900
            ${error 
              ? 'border-red-400 bg-red-50' 
              : isFocused
                ? 'border-pink-500'
                : 'border-gray-200'
            }
            ${!value ? 'text-gray-400' : ''}
            ${className}
          `}
        >
          {displayValue || (
            <span className="text-gray-400">
              Select date
            </span>
          )}
        </div>

        {/* Calendar Dropdown Indicator */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4 pointer-events-none">
          <svg 
            className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200 ${
              isFocused || value
                ? 'text-pink-500' 
                : 'text-gray-400'
            }`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600">
          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="leading-relaxed">{error}</span>
        </p>
      )}
    </div>
  );
}

CustomDatePicker.displayName = 'CustomDatePicker';

export default memo(CustomDatePicker);

