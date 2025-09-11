import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye } from 'lucide-react';

const AttentionBanner = ({ isVisible, onDismiss, message }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
        >
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-3">
              <Eye className="h-6 w-6 animate-pulse" />
              <div>
                <h3 className="font-semibold text-lg">Attention Alert</h3>
                <p className="text-sm opacity-90">{message}</p>
              </div>
            </div>
            
            <button
              onClick={onDismiss}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Animated progress bar */}
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 5, ease: 'linear' }}
            className="h-1 bg-white bg-opacity-30"
            onAnimationComplete={onDismiss}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AttentionBanner;