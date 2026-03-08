import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, change, color }) => {
  const colorClasses: { [key: string]: string } = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    indigo: 'from-indigo-500 to-indigo-600'
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100 group">
      <div className={`w-14 h-14 bg-linear-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
        {icon}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
      <p className="text-4xl font-bold text-gray-800 mb-2">{value}</p>
      <p className={`text-sm font-medium ${
        change.includes('+') ? 'text-green-600' : 
        change === 'Not trained' ? 'text-red-600' : 
        'text-blue-600'
      }`}>
        {change}
      </p>
    </div>
  );
};

export default StatCard;