import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Castle, Wrench, Flame, ArrowRight, Sparkles } from 'lucide-react';
import useGameStore from '../store/gameStore';

const paths = [
  {
    id: 'castle',
    name: 'The Castle',
    tagline: "We've got IT under control",
    description: 'Your dominoes start organized and in your court. You just need to identify where you could use some backup.',
    icon: Castle,
    color: 'from-blue-500 to-blue-600',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-500/10',
    features: [
      'All items start organized',
      'Everything defaults to you',
      'Pull items to "Need Help" as needed',
    ],
    janeComment: "Look at you with your organized infrastructure. Let's make sure nothing slips through the cracks.",
  },
  {
    id: 'workshop',
    name: 'The Workshop',
    tagline: 'Help us build this properly',
    description: "You've got some things figured out, others not so much. We'll sort through it together.",
    icon: Wrench,
    color: 'from-amber-500 to-orange-500',
    borderColor: 'border-amber-500',
    bgColor: 'bg-amber-500/10',
    features: [
      'Semi-organized starting point',
      'Guided decision making',
      'Best for growing teams',
    ],
    janeComment: "A work in progress. Perfect—that's where the interesting stuff happens.",
  },
  {
    id: 'dumpster_fire',
    name: 'The Dumpster Fire',
    tagline: 'Everything is fine.',
    description: 'A glorious chaotic pile of responsibilities. We\'ll sort through it together and figure out who does what.',
    icon: Flame,
    color: 'from-red-500 to-orange-600',
    borderColor: 'border-red-500',
    bgColor: 'bg-red-500/10',
    features: [
      'Start from chaos',
      'Everything in one pile',
      'Maximum sorting satisfaction',
    ],
    janeComment: "Ah, the honest approach. Don't worry—I've seen worse. Much worse. *stares into distance*",
    hardMode: true,
  },
];

const PathSelect = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setPath } = useGameStore();
  
  const [selectedPath, setSelectedPath] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const handleSelectPath = async (pathId) => {
    setSelectedPath(pathId);
    setIsTransitioning(true);
    
    await setPath(pathId);
    
    setTimeout(() => {
      navigate(`/play/${token}/game`);
    }, 1000);
  };
  
  const selectedPathData = paths.find(p => p.id === selectedPath);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
      </div>
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 relative z-10"
      >
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
          Choose Your Adventure
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          How would you describe your current IT situation? Be honest—Jane doesn't judge. Much.
        </p>
      </motion.div>
      
      {/* Path cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl w-full relative z-10">
        {paths.map((path, index) => {
          const Icon = path.icon;
          const isSelected = selectedPath === path.id;
          
          return (
            <motion.button
              key={path.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => !isTransitioning && handleSelectPath(path.id)}
              disabled={isTransitioning}
              className={`
                relative glass-card p-6 rounded-2xl text-left transition-all duration-300
                ${isSelected 
                  ? `${path.borderColor} border-2 scale-105 shadow-lg` 
                  : 'border border-white/10 hover:border-white/20 hover:scale-[1.02]'
                }
                ${isTransitioning && !isSelected ? 'opacity-30' : ''}
              `}
            >
              {/* Hard mode badge */}
              {path.hardMode && (
                <div className="absolute -top-2 -right-2 px-3 py-1 bg-red-500 text-white text-xs 
                                font-bold rounded-full shadow-lg">
                  HARD MODE
                </div>
              )}
              
              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${path.color} 
                              flex items-center justify-center mb-4 shadow-lg`}>
                <Icon className="text-white" size={32} />
              </div>
              
              {/* Content */}
              <h2 className="text-2xl font-bold text-white mb-1">{path.name}</h2>
              <p className="text-brand-orange font-medium mb-3">"{path.tagline}"</p>
              <p className="text-gray-400 text-sm mb-4">{path.description}</p>
              
              {/* Features */}
              <ul className="space-y-2 mb-4">
                {path.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${path.color}`} />
                    {feature}
                  </li>
                ))}
              </ul>
              
              {/* Selection indicator */}
              <div className={`
                flex items-center justify-center gap-2 py-3 rounded-xl transition-all
                ${isSelected ? `${path.bgColor} text-white` : 'bg-white/5 text-gray-400'}
              `}>
                {isSelected ? (
                  <>
                    <Sparkles size={18} />
                    <span className="font-medium">Selected!</span>
                  </>
                ) : (
                  <>
                    <span>Choose this path</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
      
      {/* Jane's comment */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center relative z-10"
      >
        {selectedPathData ? (
          <motion.p
            key={selectedPath}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gray-400 italic max-w-lg"
          >
            Jane: "{selectedPathData.janeComment}"
          </motion.p>
        ) : (
          <p className="text-gray-500">
            Jane: "Choose wisely. Or don't. We can always start over."
          </p>
        )}
      </motion.div>
      
      {/* Transition overlay */}
      {isTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-game-darker/80 backdrop-blur-sm z-50 
                     flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 border-4 border-brand-orange border-t-transparent 
                            rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Preparing your quest...</p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default PathSelect;
