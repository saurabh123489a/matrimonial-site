'use client';

import React, { useState, useRef, useEffect } from 'react';

interface CustomDatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  required?: boolean;
  min?: string;
  max?: string;
}

export default function CustomDatePicker({
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
          className="block text-sm font-semibold text-gray-700 dark:text-pink-200 mb-2"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {/* Calendar Icon */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
          <svg 
            className={`h-5 w-5 transition-colors duration-200 ${
              isFocused || value
                ? 'text-pink-500 dark:text-pink-400' 
                : 'text-gray-400 dark:text-gray-500'
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
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        />

        {/* Custom Styled Display */}
        <div
          onClick={() => inputRef.current?.showPicker?.() || inputRef.current?.focus()}
          className={`
            block w-full pl-12 pr-4 py-3 
            border-2 rounded-xl 
            transition-all duration-200 
            cursor-pointer
            bg-white dark:bg-[#1f212a]
            text-gray-900 dark:text-pink-100
            ${error 
              ? 'border-red-400 bg-red-50 dark:bg-red-900/20 dark:border-red-500' 
              : isFocused
                ? 'border-pink-500 bg-white dark:bg-[#1f212a] ring-2 ring-pink-500 ring-opacity-20'
                : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#1f212a] hover:border-pink-300 dark:hover:border-pink-600'
            }
            ${!value ? 'text-gray-400 dark:text-gray-500' : ''}
            ${className}
          `}
        >
          {displayValue || (
            <span className="text-gray-400 dark:text-gray-500">
              Select date
            </span>
          )}
        </div>

        {/* Calendar Dropdown Indicator */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <svg 
            className={`w-5 h-5 transition-colors duration-200 ${
              isFocused || value
                ? 'text-pink-500 dark:text-pink-400' 
                : 'text-gray-400 dark:text-gray-500'
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
        <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

