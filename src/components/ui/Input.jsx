import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    id,
    className = '',
    icon: Icon,
    ...props
  },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={id}
          className={`form-input ${Icon ? 'pl-10' : ''} ${
            error ? 'border-red-400 focus:ring-red-400' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
});

export default Input;
