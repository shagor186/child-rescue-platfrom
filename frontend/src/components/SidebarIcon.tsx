import React from 'react';

interface SidebarIconProps {
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

const SidebarIcon: React.FC<SidebarIconProps> = ({ icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
      active 
        ? 'bg-white bg-opacity-20 shadow-lg' 
        : 'hover:bg-white hover:bg-opacity-10'
    }`}
  >
    <span className="w-5 h-5">{icon}</span>
  </button>
);

export default SidebarIcon;