import React from 'react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  badge?: number;
  active: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, badge, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
      active 
        ? 'bg-yellow bg-opacity-20 shadow-lg scale-105' 
        : 'hover:bg-green hover:bg-opacity-10 hover:scale-102'
    }`}
  >
    <div className="flex items-center space-x-3">
      <span className={`w-5 h-5 transition-transform group-hover:scale-110 ${active ? 'animate-pulse' : ''}`}>
        {icon}
      </span>
      <span className="font-semibold">{label}</span>
    </div>
    {badge !== undefined && badge > 0 && (
      <span className="px-2 py-1 bg-white bg-opacity-30 rounded-full text-xs font-bold min-w-6 flex items-center justify-center">
        {badge > 99 ? '99+' : badge}
      </span>
    )}
  </button>
);

export default NavItem;