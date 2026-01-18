import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Trash2, X } from 'lucide-react';
import useGameStore from '../store/gameStore';

const PLAYER_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#22C55E',
  '#14B8A6', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6',
  '#A855F7', '#D946EF', '#EC4899', '#F43F5E',
];

const PlayerManager = ({ isOpen, onClose }) => {
  const { players, addPlayer, removePlayer } = useGameStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    role: '',
    color: PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)],
  });
  
  const handleAddPlayer = async () => {
    if (!newPlayer.name.trim()) return;
    
    await addPlayer(newPlayer);
    setNewPlayer({
      name: '',
      role: '',
      color: PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)],
    });
    setShowAddForm(false);
  };
  
  const handleRemovePlayer = async (playerId) => {
    if (window.confirm('Remove this player? Their responsibilities will be reassigned to TBD.')) {
      await removePlayer(playerId);
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                       w-full max-w-md bg-game-surface border border-white/10 
                       rounded-2xl shadow-game-lg z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Users className="text-brand-orange" size={24} />
                <h2 className="text-xl font-bold text-white">Players</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Player list */}
            <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto">
              {players.map(player => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-game-dark/50"
                >
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: player.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{player.name}</p>
                    {player.role && (
                      <p className="text-xs text-gray-500 truncate">{player.role}</p>
                    )}
                  </div>
                  {player.is_default ? (
                    <span className="text-xs text-gray-500 px-2 py-1 bg-game-dark rounded">
                      Default
                    </span>
                  ) : (
                    <button
                      onClick={() => handleRemovePlayer(player.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              
              {/* Add player form */}
              <AnimatePresence>
                {showAddForm ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 p-4 rounded-xl border border-white/10 bg-game-dark/30"
                  >
                    <input
                      type="text"
                      placeholder="Player name"
                      value={newPlayer.name}
                      onChange={(e) => setNewPlayer(p => ({ ...p, name: e.target.value }))}
                      className="input-field"
                      autoFocus
                    />
                    <input
                      type="text"
                      placeholder="Role (optional)"
                      value={newPlayer.role}
                      onChange={(e) => setNewPlayer(p => ({ ...p, role: e.target.value }))}
                      className="input-field"
                    />
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Color</label>
                      <div className="flex flex-wrap gap-2">
                        {PLAYER_COLORS.map(color => (
                          <button
                            key={color}
                            onClick={() => setNewPlayer(p => ({ ...p, color }))}
                            className={`w-6 h-6 rounded-full transition-transform
                                      ${newPlayer.color === color ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddPlayer}
                        disabled={!newPlayer.name.trim()}
                        className="btn-primary flex-1"
                      >
                        Add Player
                      </button>
                      <button
                        onClick={() => setShowAddForm(false)}
                        className="btn-ghost"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setShowAddForm(true)}
                    className="w-full flex items-center justify-center gap-2 p-3 
                               rounded-xl border border-dashed border-white/20
                               text-gray-400 hover:text-white hover:border-white/40
                               transition-all"
                  >
                    <Plus size={18} />
                    Add Player
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-white/10">
              <button onClick={onClose} className="btn-primary w-full">
                Done
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PlayerManager;
