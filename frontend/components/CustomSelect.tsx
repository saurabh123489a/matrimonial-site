'use client';

import React, { memo } from 'react';

interface CustomSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
}

function CustomSelect({
  label,
  error,
  icon,
  required,
  options,
  className = '',
  ...props
}: CustomSelectProps) {
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
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none z-10 text-gray-400">
            <div className="h-4 w-4 sm:h-5 sm:w-5">
              {icon}
            </div>
          </div>
        )}
        <select
          {...props}
          className={`
            block w-full 
            ${icon ? 'pl-10 sm:pl-12' : 'pl-3 sm:pl-4'} 
            pr-10 sm:pr-12 py-2.5 sm:py-3 
            border-2 rounded-lg sm:rounded-xl 
            transition-all duration-200 
            focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 
            text-sm sm:text-base
            appearance-none
            cursor-pointer
            touch-target
            bg-white
            text-gray-900
            ${error 
              ? 'border-red-400 bg-red-50' 
              : 'border-gray-200'
            }
            hover:border-pink-300
            focus:ring-pink-500
            focus:border-pink-500
            ${className}
          `}
        >
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              className="bg-white"
            >
              {option.label}
            </option>
          ))}
        </select>
        {/* Custom Dropdown Arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4 pointer-events-none">
          <svg 
            className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 text-gray-400
              props.value ? 'text-pink-500' : ''
            }`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2.5} 
              d="M19 9l-7 7-7-7" 
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

CustomSelect.displayName = 'CustomSelect';

export default memo(CustomSelect);

