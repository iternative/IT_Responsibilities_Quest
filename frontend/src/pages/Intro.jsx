import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, SkipForward } from 'lucide-react';
import useGameStore from '../store/gameStore';

const janeIntroLines = [
  {
    text: "Oh wonderful. Another company that needs to figure out who's responsible for what.",
    delay: 0,
  },
  {
    text: "Don't worry—I've done this approximately 847 times. Only three ended in tears.",
    delay: 2500,
  },
  {
    text: "I'm Jane. I'll be your guide through the thrilling world of IT responsibility assignment.",
    delay: 5500,
  },
  {
    text: "You're the main character here. I'm just the patch that keeps your plot from crashing.",
    delay: 8500,
  },
  {
    text: "Ready to sort out this beautiful chaos together? I got your back.",
    delay: 11500,
  },
];

const Intro = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { client, session } = useGameStore();
  
  const [currentLine, setCurrentLine] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showContinue, setShowContinue] = useState(false);
  
  // Typing effect
  useEffect(() => {
    if (currentLine >= janeIntroLines.length) {
      setShowContinue(true);
      return;
    }
    
    const line = janeIntroLines[currentLine];
    let charIndex = 0;
    setDisplayedText('');
    setIsTyping(true);
    
    const typingInterval = setInterval(() => {
      if (charIndex < line.text.length) {
        setDisplayedText(line.text.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        
        // Auto-advance to next line
        setTimeout(() => {
          if (currentLine < janeIntroLines.length - 1) {
            setCurrentLine(prev => prev + 1);
          } else {
            setShowContinue(true);
          }
        }, 2000);
      }
    }, 30);
    
    return () => clearInterval(typingInterval);
  }, [currentLine]);
  
  const handleSkip = () => {
    navigate(`/play/${token}/profile`);
  };
  
  const handleContinue = () => {
    navigate(`/play/${token}/profile`);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] 
                        bg-brand-orange/5 rounded-full blur-3xl" />
      </div>
      
      {/* Skip button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={handleSkip}
        className="absolute top-6 right-6 btn-ghost text-sm flex items-center gap-2"
      >
        <SkipForward size={16} />
        Skip Intro
      </motion.button>
      
      {/* Jane avatar and dialogue */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-2xl w-full text-center"
      >
        {/* Jane avatar */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="relative mx-auto mb-8"
        >
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-brand-orange to-brand-orange-dark
                          flex items-center justify-center mx-auto shadow-glow-orange">
            <Sparkles className="text-white" size={48} />
          </div>
          
          {/* Pulse effect */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-brand-orange"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
            }}
          />
          
          {/* Name tag */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 
                       bg-game-surface border border-white/10 rounded-full"
          >
            <span className="text-sm font-semibold text-white">Jane</span>
          </motion.div>
        </motion.div>
        
        {/* Dialogue box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-8 rounded-3xl relative"
        >
          {/* Speech bubble pointer */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 
                          bg-game-surface rotate-45 border-l border-t border-white/10" />
          
          {/* Text content */}
          <div className="min-h-[120px] flex items-center justify-center">
            <p className="text-xl md:text-2xl text-white font-display leading-relaxed">
              {displayedText}
              {isTyping && (
                <span className="inline-block w-0.5 h-6 bg-brand-orange ml-1 animate-pulse" />
              )}
            </p>
          </div>
          
          {/* Line indicators */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {janeIntroLines.map((_, i) => (
              <motion.div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  i === currentLine 
                    ? 'bg-brand-orange' 
                    : i < currentLine 
                      ? 'bg-brand-orange/50' 
                      : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </motion.div>
        
        {/* Continue button */}
        <AnimatePresence>
          {showContinue && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={handleContinue}
              className="group btn-primary mt-8 flex items-center gap-3 mx-auto"
            >
              Let's Do This
              <ArrowRight 
                className="transition-transform group-hover:translate-x-1" 
                size={20} 
              />
            </motion.button>
          )}
        </AnimatePresence>
        
        {/* Click to advance hint */}
        {!showContinue && !isTyping && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-sm text-gray-500"
          >
            Click anywhere to continue...
          </motion.p>
        )}
      </motion.div>
      
      {/* Click to advance */}
      {!showContinue && !isTyping && (
        <div 
          className="absolute inset-0 cursor-pointer z-0"
          onClick={() => setCurrentLine(prev => Math.min(prev + 1, janeIntroLines.length - 1))}
        />
      )}
    </div>
  );
};

export default Intro;
