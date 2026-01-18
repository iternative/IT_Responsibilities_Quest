import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, MessageCircle, ChevronRight } from 'lucide-react';
import useGameStore from '../store/gameStore';

const API_BASE = '/api';

const DetailPanel = ({ isOpen, onClose, assignment }) => {
  const { players, assignPlayer, toggleJaneChat } = useGameStore();
  const [explanation, setExplanation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (isOpen && assignment) {
      loadExplanation();
    }
  }, [isOpen, assignment?.template_id]);
  
  const loadExplanation = async () => {
    if (!assignment) return;
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/jane/explain/${assignment.template_id}`);
      const data = await response.json();
      setExplanation(data);
    } catch (error) {
      console.error('Failed to load explanation:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAssignPlayer = async (playerId) => {
    if (assignment) {
      await assignPlayer(assignment.template_id, playerId);
    }
  };
  
  const currentPlayer = players.find(p => p.id === assignment?.player_id);
  
  return (
    <AnimatePresence>
      {isOpen && assignment && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg 
                       bg-game-surface border-l border-white/10 
                       shadow-game-lg z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-game-surface/95 backdrop-blur-xl 
                            border-b border-white/10 p-6 z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                    <span className="capitalize">{assignment.category}</span>
                    <ChevronRight size={14} />
                    <span>{assignment.title}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {assignment.title}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-brand-orange border-t-transparent 
                                  rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Description */}
                  <section>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      What It Is
                    </h3>
                    <p className="text-gray-200 leading-relaxed">
                      {assignment.description || explanation?.whatItIs}
                    </p>
                  </section>
                  
                  {/* Why it matters - Jane's wisdom */}
                  {(assignment.why_it_matters || explanation?.whyItMatters) && (
                    <section className="glass-card p-4 border-l-4 border-l-brand-orange">
                      <h3 className="text-sm font-semibold text-brand-orange mb-2 flex items-center gap-2">
                        <MessageCircle size={16} />
                        Jane Says
                      </h3>
                      <p className="text-gray-300 italic leading-relaxed">
                        "{assignment.why_it_matters || explanation?.whyItMatters}"
                      </p>
                    </section>
                  )}
                  
                  {/* Typical owner */}
                  {(assignment.typical_owner || explanation?.typicalOwner) && (
                    <section>
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Typically Owned By
                      </h3>
                      <p className="text-gray-200">
                        {assignment.typical_owner || explanation?.typicalOwner}
                      </p>
                    </section>
                  )}
                  
                  {/* Jane's advice */}
                  {explanation?.janeAdvice && (
                    <section className="bg-game-dark/50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Pro Tip
                      </h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {explanation.janeAdvice}
                      </p>
                    </section>
                  )}
                  
                  {/* Current assignment */}
                  <section>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Assigned To
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {players.map(player => (
                        <button
                          key={player.id}
                          onClick={() => handleAssignPlayer(player.id)}
                          className={`
                            flex items-center gap-3 p-3 rounded-xl border transition-all
                            ${player.id === assignment.player_id
                              ? 'border-brand-orange bg-brand-orange/10'
                              : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                            }
                          `}
                        >
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: player.color }}
                          />
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-white">{player.name}</p>
                            {player.role && (
                              <p className="text-xs text-gray-500">{player.role}</p>
                            )}
                          </div>
                          {player.id === assignment.player_id && (
                            <div className="w-2 h-2 rounded-full bg-brand-orange" />
                          )}
                        </button>
                      ))}
                    </div>
                  </section>
                  
                  {/* Ask Jane button */}
                  <button
                    onClick={() => {
                      toggleJaneChat();
                      onClose();
                    }}
                    className="w-full btn-secondary flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={18} />
                    Ask Jane About This
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DetailPanel;
