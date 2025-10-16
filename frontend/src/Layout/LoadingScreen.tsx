// src/components/ui/LoadingScreen.tsx
import React from "react";
import { motion, type Variants } from "framer-motion";

const spinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      repeat: Infinity,
      duration: 1,
      ease: "linear",
    },
  },
};

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const LoadingScreen: React.FC = () => {
  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center bg-gray-950 text-white z-50"
      variants={fadeInVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.div
        className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full"
        variants={spinnerVariants}
        animate="animate"
      />
      <motion.p
        className="mt-6 text-lg text-gray-300 font-medium text-center max-w-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        While the charts and tables are loading, a loading screen will be displayed.
      </motion.p>
    </motion.div>
  );
};

export default LoadingScreen;
