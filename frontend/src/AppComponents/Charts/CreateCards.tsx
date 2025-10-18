import type { LucideIcon } from 'lucide-react';

interface CreateCardTriggerProps {
  label: string;
  icon: LucideIcon;
  color: 'blue' | 'red' | 'green' | 'purple';
  onClick?: () => void;
  children?: React.ReactNode;
}

const CreateCards = ({ label, icon: Icon, color, onClick, children }: CreateCardTriggerProps) => {
  // Color mapping for the four supported colors
  const colorClasses = {
    blue: {
      border: 'border-blue-500',
      bg: 'bg-blue-100 dark:bg-blue-900/40',
      text: 'text-blue-600',
    },
    red: {
      border: 'border-red-500',
      bg: 'bg-red-100 dark:bg-red-900/40',
      text: 'text-red-600',
    },
    green: {
      border: 'border-green-500',
      bg: 'bg-green-100 dark:bg-green-900/40',
      text: 'text-green-600',
    },
    purple: {
      border: 'border-purple-500',
      bg: 'bg-purple-100 dark:bg-purple-900/40',
      text: 'text-purple-600',
    },
  };

  const colors = colorClasses[color];

  return (
    <div
      onClick={onClick}
      className={`
        w-full
        bg-white dark:bg-stone-900 
        rounded-2xl p-6 shadow-md 
        border-l-4 ${colors.border}
        hover:shadow-lg transition-shadow
        hover:scale-105 transform transition-transform
        cursor-pointer
      `}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <div className={`p-4 rounded-xl ${colors.bg} mb-4`}>
          <Icon className={`w-8 h-8 ${colors.text}`} />
        </div>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          Create {label}
        </span>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Click to create new {label}
        </p>
      </div>
      {children}
    </div>
  );
};

export default CreateCards;