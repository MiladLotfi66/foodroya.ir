// InputField.jsx
import React from 'react';

function InputField({
  label,
  Icon,
  register,
  name,
  type,
  placeholder,
  error,
  iconSize,
  rightElement,
}) {
  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={name} className="mb-1 text-gray-700 dark:text-gray-200">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className={`${iconSize} text-gray-400`} />
          </div>
        )}
        <input
          id={name}
          type={type}
          {...register(name)}
          placeholder={placeholder}
          className={`w-full ${
            Icon ? 'pl-10' : 'pl-3'
          } ${
            rightElement ? 'pr-10' : 'pr-3'
          } py-2 border ${
            error ? 'border-red-500' : 'border-gray-300'
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && <span className="text-red-500 text-sm mt-1">{error.message}</span>}
    </div>
  );
}

export default InputField;
