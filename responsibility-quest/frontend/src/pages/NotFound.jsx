import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] 
                        bg-red-500/5 rounded-full blur-3xl" />
      </div>
      
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-24 h-24 rounded-full bg-game-surface border border-white/10 
                      flex items-center justify-center mx-auto mb-8"
        >
          <MapPin className="text-gray-400" size={40} />
        </motion.div>
        
        <h1 className="text-7xl font-display font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-2">Page Not Found</h2>
        <p className="text-gray-400 mb-8">
          Looks like this responsibility was never assigned. 
          Jane would have something sarcastic to say about that.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn-primary flex items-center gap-2"
          >
            <Home size={18} />
            Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
