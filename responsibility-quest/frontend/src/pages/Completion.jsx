import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Medal, 
  Download, 
  Share2, 
  RefreshCw, 
  FileText,
  Trophy,
  Sparkles,
  PartyPopper
} from 'lucide-react';
import useGameStore from '../store/gameStore';

// Confetti colors
const confettiColors = ['#FF6B35', '#FFD700', '#8B5CF6', '#10B981', '#3B82F6', '#EC4899'];

const Confetti = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {[...Array(50)].map((_, i) => {
        const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
        const left = Math.random() * 100;
        const delay = Math.random() * 3;
        const duration = 3 + Math.random() * 2;
        
        return (
          <motion.div
            key={i}
            className="absolute w-3 h-3"
            style={{
              left: `${left}%`,
              top: -20,
              backgroundColor: color,
              borderRadius: Math.random() > 0.5 ? '50%' : '0%',
            }}
            initial={{ y: -20, rotate: 0, opacity: 1 }}
            animate={{
              y: '100vh',
              rotate: 720,
              opacity: 0,
            }}
            transition={{
              duration,
              delay,
              ease: 'easeIn',
            }}
          />
        );
      })}
    </div>
  );
};

const medalQuotes = {
  "Medal of Absolute Certainty": "You knew exactly what you wanted. That's either impressive planning or concerning confidence. Either way, we're here for it.",
  "Medal of Partial Clarity": "A few unknowns isn't bad. I've seen worse. Much worse. *stares into distance*",
  "Medal of Strategic Ambiguity": "Some people call it 'undecided.' We call it 'strategically flexible.'",
  "Medal of Brave Confusion": "Admitting you don't know is the first step to... knowing. Probably.",
  "Medal of the One-Person IT Department": "You've assigned everything to one person. Are they... aware of this?",
  "Medal of Suspiciously Fast Decisions": "That was... suspiciously fast. Either you're a genius or you're guessing. Both are valid.",
  "Medal of Thorough Contemplation": "You took your time. Good things come to those who think really, really hard about IT governance.",
};

const Completion = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { 
    session, 
    client, 
    stats, 
    completeGame, 
    exportMarkdown,
    loadSession 
  } = useGameStore();
  
  const [completionData, setCompletionData] = useState(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  useEffect(() => {
    if (!session && token) {
      loadSession(token);
    }
  }, [token, session]);
  
  useEffect(() => {
    const complete = async () => {
      if (session && session.status !== 'completed' && !isCompleting) {
        setIsCompleting(true);
        const data = await completeGame();
        setCompletionData(data);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      } else if (session && session.status === 'completed') {
        setCompletionData({ 
          session, 
          stats: {
            unknownCount: stats.unknown,
            totalItems: stats.total,
            medalType: session.medal_type
          }
        });
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    };
    complete();
  }, [session]);
  
  const handleExport = async () => {
    setIsExporting(true);
    const markdown = await exportMarkdown();
    
    if (markdown) {
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `responsibility-matrix-${client.name.toLowerCase().replace(/\s+/g, '-')}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    
    setIsExporting(false);
  };
  
  const handleStartOver = () => {
    if (window.confirm('Start a new quest? Your current progress will be saved.')) {
      navigate(`/play/${token}`);
    }
  };
  
  const medalType = completionData?.stats?.medalType || session?.medal_type || 'Medal of Completion';
  const medalQuote = medalQuotes[medalType] || "You did it. Against all odds and attention spans.";
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && <Confetti />}
      
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl" />
      </div>
      
      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-2xl w-full text-center"
      >
        {/* Trophy icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center">
            <PartyPopper className="text-yellow-400 absolute -left-8 -top-4" size={32} />
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 
                            flex items-center justify-center shadow-glow-gold">
              <Trophy className="text-white" size={48} />
            </div>
            <PartyPopper className="text-yellow-400 absolute -right-8 -top-4 scale-x-[-1]" size={32} />
          </div>
        </motion.div>
        
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
            Quest Complete!
          </h1>
          <p className="text-xl text-gray-400">
            You've earned the prestigious...
          </p>
        </motion.div>
        
        {/* Medal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="my-12"
        >
          <div className="glass-card p-8 rounded-3xl border-2 border-yellow-500/30">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Medal className="text-yellow-400" size={40} />
              <h2 className="text-2xl md:text-3xl font-bold text-gradient-gold">
                {medalType}
              </h2>
              <Medal className="text-yellow-400 scale-x-[-1]" size={40} />
            </div>
            
            <p className="text-gray-300 italic max-w-md mx-auto">
              "{medalQuote}"
            </p>
            
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-sm text-gray-500">
                Awarded to <span className="text-white font-medium">{client.name}</span>
              </p>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* Stats summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <div className="glass-card p-4 rounded-xl">
            <p className="text-3xl font-bold text-pile-handled">{stats.handled}</p>
            <p className="text-sm text-gray-400">Handled</p>
          </div>
          <div className="glass-card p-4 rounded-xl">
            <p className="text-3xl font-bold text-pile-need-help">{stats.need_help}</p>
            <p className="text-sm text-gray-400">Need Help</p>
          </div>
          <div className="glass-card p-4 rounded-xl">
            <p className="text-3xl font-bold text-pile-unknown">{stats.unknown}</p>
            <p className="text-sm text-gray-400">Unknown</p>
          </div>
        </motion.div>
        
        {/* Jane's closing */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Sparkles className="text-brand-orange" size={20} />
            <span className="text-brand-orange font-medium">Jane says:</span>
          </div>
          <p className="text-gray-400 italic">
            "Your documentation awaits. Guard it well. Or lose it and we'll do this again in 6 months."
          </p>
        </motion.div>
        
        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="space-y-3"
        >
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full btn-primary flex items-center justify-center gap-3"
          >
            {isExporting ? (
              <>
                <RefreshCw className="animate-spin" size={20} />
                Generating...
              </>
            ) : (
              <>
                <Download size={20} />
                Download Responsibility Matrix
              </>
            )}
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/play/${token}/game`)}
              className="flex-1 btn-secondary flex items-center justify-center gap-2"
            >
              <FileText size={18} />
              Review
            </button>
            <button
              onClick={handleStartOver}
              className="flex-1 btn-ghost flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Start Over
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Completion;
