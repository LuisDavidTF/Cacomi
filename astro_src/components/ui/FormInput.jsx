import React from 'react';

export const FormInput = ({ id, label, type = 'text', value, onChange, error, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1">
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border rounded-lg shadow-xs focus:outline-none focus:ring-2 bg-background border-input text-foreground placeholder:text-muted-foreground ${error ? 'border-destructive ring-destructive' : 'focus:ring-ring focus:border-ring'}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
};