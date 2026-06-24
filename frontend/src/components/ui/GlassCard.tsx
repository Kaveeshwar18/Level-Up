import React from 'react';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export const GlassCard: React.FC<Props> = ({ children, hoverable = false, className = '', ...props }) => {
  return (
    <div
      className={`glass-card rounded-2xl p-6 ${hoverable ? 'glass-card-hover' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
export default GlassCard;
