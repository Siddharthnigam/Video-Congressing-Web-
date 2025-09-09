import { motion } from 'framer-motion';
import { Video } from 'lucide-react';

const Navbar = ({ title = 'VideoMeet' }) => {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white shadow-sm border-b border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Video className="h-8 w-8 text-blue-500" />
            <span className="text-xl font-semibold text-gray-900">{title}</span>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;