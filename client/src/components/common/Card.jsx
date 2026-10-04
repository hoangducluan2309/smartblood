import React from 'react';

/**
 * Reusable Card Component
 * Bo góc 12px chuẩn (rounded-xl), nền trắng sạch sẽ trên nền xám nhạt
 */
export const Card = ({
  children,
  className = '',
  hoverEffect = true,
  bordered = true,
  onClick,
  ...props
}) => {
  const baseClasses = 'bg-white rounded-xl transition-all duration-200 overflow-hidden';
  const borderClasses = bordered ? 'border border-slate-200/80 shadow-soft' : 'shadow-soft';
  const hoverClasses = hoverEffect ? 'hover:shadow-md hover:border-slate-300' : '';
  const interactiveClasses = onClick ? 'cursor-pointer active:scale-[0.99]' : '';

  return (
    <div
      onClick={onClick}
      className={`${baseClasses} ${borderClasses} ${hoverClasses} ${interactiveClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`p-5 pb-3 border-b border-slate-100 ${className}`}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`p-5 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`p-5 pt-3 border-t border-slate-100 bg-slate-50/50 ${className}`}>
    {children}
  </div>
);
