import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const AttentionBanner = ({ isVisible, onDismiss, message = "Please focus on the meeting" }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-4 flex items-center space-x-3 max-w-md">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <p className="text-yellow-800 text-sm font-medium flex-1">{message}</p>
            <button
              onClick={onDismiss}
              className="text-yellow-600 hover:text-yellow-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AttentionBanner;