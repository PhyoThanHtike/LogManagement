// components/ElegantSpinner.tsx
import { motion } from 'framer-motion';

interface ElegantSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

const Spinner = ({ 
  size = 'md', 
  color = 'primary',
  className = ''
}: ElegantSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-14 h-14 border-4'
  };

  const colorClasses = {
    primary: 'border-blue-500 border-t-blue-200',
    white: 'border-white border-t-white/20',
    gray: 'border-gray-400 border-t-gray-200'
  };

  return (
    <motion.div
      className={`
        ${sizeClasses[size]} 
        ${colorClasses[color]}
        border-solid 
        rounded-full
        ${className}
      `}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  );
};

export default Spinner;