import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'info' | 'light';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  isLoading = false,
  className = '',
  ...props
}, ref) => {
  const baseStyles = "font-semibold rounded-lg transition duration-150 ease-in-out flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-sm hover:shadow-md";

  const sizeStyles = {
    sm: "py-1.5 px-3 text-xs",
    md: "py-2 px-4 text-sm",
    lg: "py-3 px-6 text-base",
  };

  const variantStyles = {
    primary: "bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-500 dark:bg-teal-500 dark:hover:bg-teal-600",
    secondary: "bg-slate-600 hover:bg-slate-700 text-white focus:ring-slate-500 dark:bg-slate-500 dark:hover:bg-slate-600",
    danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700",
    success: "bg-emerald-500 hover:bg-emerald-600 text-white focus:ring-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-700",
    info: "bg-sky-500 hover:bg-sky-600 text-white focus:ring-sky-500 dark:bg-sky-600 dark:hover:sky-700",
    light: "bg-slate-100 hover:bg-slate-200 text-slate-700 focus:ring-slate-400 border border-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 dark:border-slate-500 dark:focus:ring-slate-500",
  };

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {icon && !isLoading && <span className="material-icons-outlined mr-1.5 text-base sm:text-lg leading-none">{icon}</span>}
      {children}
    </button>
  );
});

Button.displayName = 'Button'; // Optional: for better debugging

export default Button;