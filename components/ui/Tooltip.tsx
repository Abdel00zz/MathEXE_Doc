import React, { useState, ReactNode } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, text }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div 
          role="tooltip"
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-max max-w-xs px-2.5 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-md shadow-lg z-20"
        >
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip;