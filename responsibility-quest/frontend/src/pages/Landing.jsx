import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Shield, Zap } from 'lucide-react';
import useGameStore from '../store/gameStore';

const Landing = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { loadSession, isLoading, error, client, session } = useGameStore();
  
  useEffect(() => {
    if (token) {
      loadSession(token);
    }
  }, [token]);
  
  // If session exists and is in progress, redirect to appropriate page
  useEffect(() => {
    if (session && session.status !== 'draft') {
      if (session.status === 'completed') {
        navigate(`/play/${token}/complete`);
      } else if (session.path_chosen) {
        navigate(`/play/${token}/game`);
      }
    }
  }, [session]);
  
  const handleStart = () => {
    navigate(`/play/${token}/intro`);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-brand-orange border-t-transparent 
                          rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your quest...</p>
        </motion.div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 max-w-md text-center"
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-red-400" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Quest Not Found</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <p className="text-sm text-gray-500">
            Please check your link or contact ITernative for a new invitation.
          </p>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-brand-orange/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
      
      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-2xl"
      >
        {/* Client logo */}
        {client.logo_url ? (
          <motion.img
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            src={client.logo_url}
            alt={client.name}
            className="h-16 mx-auto mb-8 object-contain"
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <span 
              className="text-3xl font-bold"
              style={{ color: client.primary_color }}
            >
              {client.name || 'ITernative'}
            </span>
          </motion.div>
        )}
        
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="text-brand-orange" size={32} />
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white">
              Responsibility
              <span className="text-gradient"> Quest</span>
            </h1>
          </div>
          <p className="text-xl text-gray-400 mb-2">
            Turn chaos into clarity. One domino at a time.
          </p>
          <p className="text-sm text-gray-500">
            powered by <span className="text-brand-orange">ITernative</span>
          </p>
        </motion.div>
        
        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-8 my-12 text-sm text-gray-400"
        >
          <div className="flex items-center gap-2">
            <Zap className="text-brand-orange" size={18} />
            <span>10-15 minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="text-brand-orange" size={18} />
            <span>No account needed</span>
          </div>
        </motion.div>
        
        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          className="group btn-primary text-lg px-10 py-4 flex items-center gap-3 mx-auto"
        >
          I Suppose We Should Start
          <ArrowRight 
            className="transition-transform group-hover:translate-x-1" 
            size={20} 
          />
        </motion.button>
        
        {/* Skip option */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 text-sm text-gray-500"
        >
          Just want to see the game?{' '}
          <button 
            onClick={() => navigate(`/play/${token}/path`)}
            className="text-brand-orange hover:underline"
          >
            Skip intro
          </button>
        </motion.p>
      </motion.div>
      
      {/* Bottom decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-game-darker to-transparent pointer-events-none"
      />
    </div>
  );
};

export default Landing;
