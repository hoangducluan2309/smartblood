import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable Button Component
 * Tuân thủ màu chủ đạo đỏ #D32F2F, bo góc 12px, tối ưu thao tác trên mobile
 */
export const Button = ({
  children,
  variant = 'primary', // primary | secondary | outline | danger | ghost
  size = 'md', // sm | md | lg
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  // Base style với bo góc 12px chuẩn
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 select-none';

  // Biến thể màu sắc
  const variantStyles = {
    primary: 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm hover:shadow-glow focus:ring-brand-500',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 focus:ring-slate-400',
    outline: 'border-2 border-brand-500 text-brand-500 hover:bg-brand-50 focus:ring-brand-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-600',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-300',
  };

  // Kích thước (tối thiểu 44px trên mobile để dễ chạm cảm ứng)
  const sizeStyles = {
    sm: 'text-xs px-3 py-2 min-h-[36px] gap-1.5',
    md: 'text-sm px-4 py-2.5 min-h-[44px] gap-2',
    lg: 'text-base px-6 py-3.5 min-h-[50px] gap-2.5 font-semibold',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${widthStyle} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
};
