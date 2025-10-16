import type { LucideIcon } from 'lucide-react';

interface CreateCardTriggerProps {
  label: string;
  icon: LucideIcon;
  color: string;
  onClick?: () => void; // Add this line
  children?: React.ReactNode; // Add this line
}

const CreateCards = ({ label, icon: Icon, color, onClick, children }: CreateCardTriggerProps) => {
  return (
    <div
      onClick={onClick} // Add this onClick handler
      className={`
        w-full
        bg-white dark:bg-stone-900 
        rounded-2xl p-6 shadow-md 
        border-l-4 border-${color}-500 
        hover:shadow-lg transition-shadow
        hover:scale-105 transform transition-transform
        cursor-pointer
      `}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <div className={`p-4 rounded-xl bg-${color}-100 dark:bg-${color}-900/40 mb-4`}>
          <Icon className={`w-8 h-8 text-${color}-600`} />
        </div>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          {label}
        </span>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Click to create new {label}
        </p>
      </div>
      {children} {/* Render children if any */}
    </div>
  );
};

export default CreateCards;