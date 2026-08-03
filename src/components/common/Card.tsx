import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, subtitle }) => {
  return (
    <div className={`card ${className}`}>
      {title && (
        <div className="mb-6">
          <h3 className="text-2xl font-bold">{title}</h3>
          {subtitle && <p className="text-lg text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};
