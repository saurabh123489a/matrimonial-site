'use client';

import React from 'react';

interface CustomSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
}

export default function CustomSelect({
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
          className="block text-sm font-semibold text-gray-700 dark:text-pink-200 mb-2"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <div className="text-gray-400 dark:text-gray-500">
              {icon}
            </div>
          </div>
        )}
        <select
          {...props}
          className={`
            block w-full 
            ${icon ? 'pl-12' : 'pl-4'} 
            pr-12 py-3 
            border-2 rounded-xl 
            transition-all duration-200 
            focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 
            sm:text-sm
            appearance-none
            cursor-pointer
            bg-white dark:bg-[#1f212a]
            text-gray-900 dark:text-pink-100
            ${error 
              ? 'border-red-400 bg-red-50 dark:bg-red-900/20 dark:border-red-500' 
              : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#1f212a] focus:bg-white dark:focus:bg-[#1f212a]'
            }
            hover:border-pink-300 dark:hover:border-pink-600
            ${className}
          `}
        >
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              className="bg-white dark:bg-[#1f212a] text-gray-900 dark:text-pink-100"
            >
              {option.label}
            </option>
          ))}
        </select>
        {/* Custom Dropdown Arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <svg 
            className={`w-5 h-5 transition-transform duration-200 text-gray-400 dark:text-gray-500 ${
              props.value ? 'text-pink-500 dark:text-pink-400' : ''
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

