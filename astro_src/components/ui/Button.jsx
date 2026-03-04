import React from 'react';

export const Button = ({ children, onClick, type = 'button', variant = 'primary', isLoading = false, className = '', ...props }) => {
  /* 
    PREMIUM BUTTON DESIGN SYSTEM
    - Standardized Semantic Tokens
    - Clean, Solid Colors for better accessibility and consistency
  */
  const baseClasses = "flex justify-center items-center py-2.5 px-5 border border-transparent rounded-xl shadow-sm text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform active:scale-95";

  const variants = {
    // PRIMARY: Main Call-to-Action
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-ring shadow-md hover:shadow-lg",

    // SECONDARY: Edit, Navigate, Info
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 focus:ring-blue-500 shadow-md",

    // DANGER: Delete, Critical
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive shadow-md",

    // GHOST: Subtle (Cancel, Secondary Nav)
    ghost: "bg-transparent text-foreground hover:bg-muted dark:hover:bg-muted shadow-none hover:shadow-none border border-border dark:border-border",

    // OUTLINE: Clean border
    outline: "bg-transparent border-2 border-border text-foreground hover:border-primary hover:text-primary shadow-none hover:shadow-sm",

    // EDIT: Alias for Secondary
    edit: "bg-secondary text-secondary-foreground hover:bg-secondary/90 focus:ring-blue-500 shadow-md",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : children}
    </button>
  );
};