import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { 
  ChevronDown, 
  ChevronRight, 
  User, 
  HelpCircle,
  GripVertical 
} from 'lucide-react';
import useGameStore from '../store/gameStore';

const categoryColors = {
  leadership: 'border-l-category-leadership bg-category-leadership/5',
  governance: 'border-l-category-governance bg-category-governance/5',
  security: 'border-l-category-security bg-category-security/5',
  infrastructure: 'border-l-category-infrastructure bg-category-infrastructure/5',
  cloud: 'border-l-category-cloud bg-category-cloud/5',
  support: 'border-l-category-support bg-category-support/5',
  data: 'border-l-category-data bg-category-data/5',
  applications: 'border-l-category-applications bg-category-applications/5',
  projects: 'border-l-category-projects bg-category-projects/5',
  assets: 'border-l-category-assets bg-category-assets/5',
};

const pileColors = {
  handled: 'ring-2 ring-pile-handled/50',
  need_help: 'ring-2 ring-pile-need-help/50',
  unknown: 'ring-2 ring-pile-unknown/50',
  unassigned: '',
};

const Domino = ({ 
  assignment, 
  children = [], 
  depth = 0,
  onDetailClick,
  onAssignPlayer,
}) => {
  const { 
    expandedItems, 
    toggleExpanded, 
    players,
    selectItem,
  } = useGameStore();
  
  const [showPlayerMenu, setShowPlayerMenu] = useState(false);
  
  const isExpanded = expandedItems.has(assignment.template_id);
  const hasChildren = children.length > 0;
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: assignment.template_id,
    data: {
      type: 'domino',
      assignment,
    },
  });
  
  const style = {
    transform: CSS.Translate.toString(transform),
    marginLeft: depth * 16,
  };
  
  const categoryClass = categoryColors[assignment.category] || 'border-l-gray-500';
  const pileClass = pileColors[assignment.pile] || '';
  
  const currentPlayer = players.find(p => p.id === assignment.player_id);
  
  return (
    <div className="relative">
      <motion.div
        ref={setNodeRef}
        style={style}
        {...attributes}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`
          domino border-l-4 ${categoryClass} ${pileClass}
          ${isDragging ? 'domino-dragging z-50' : ''}
          ${depth > 0 ? 'ml-4 opacity-90' : ''}
        `}
      >
        <div className="flex items-start gap-3">
          {/* Drag handle */}
          <div 
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300"
          >
            <GripVertical size={16} />
          </div>
          
          {/* Expand/collapse button */}
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(assignment.template_id)}
              className="mt-1 text-gray-400 hover:text-white transition-colors"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 
                className="font-medium text-white cursor-pointer hover:text-brand-orange transition-colors"
                onClick={() => onDetailClick?.(assignment)}
              >
                {assignment.title}
              </h3>
              
              {/* Help icon */}
              <button
                onClick={() => onDetailClick?.(assignment)}
                className="text-gray-500 hover:text-brand-orange transition-colors flex-shrink-0"
              >
                <HelpCircle size={16} />
              </button>
            </div>
            
            {assignment.description && depth === 0 && (
              <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                {assignment.description}
              </p>
            )}
            
            {/* Player assignment */}
            <div className="mt-2 flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowPlayerMenu(!showPlayerMenu)}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg bg-game-dark/50 
                             hover:bg-game-dark transition-colors text-sm"
                  style={{ 
                    borderLeft: `3px solid ${currentPlayer?.color || '#6B7280'}` 
                  }}
                >
                  <User size={14} className="text-gray-400" />
                  <span className="text-gray-300">
                    {currentPlayer?.name || 'Unassigned'}
                  </span>
                </button>
                
                {/* Player dropdown */}
                <AnimatePresence>
                  {showPlayerMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute top-full left-0 mt-1 z-50 min-w-[180px]
                                 bg-game-surface border border-white/10 rounded-lg shadow-game-lg
                                 overflow-hidden"
                    >
                      {players.map(player => (
                        <button
                          key={player.id}
                          onClick={() => {
                            onAssignPlayer?.(assignment.template_id, player.id);
                            setShowPlayerMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 
                                     hover:bg-white/5 transition-colors text-left"
                        >
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: player.color }}
                          />
                          <span className="text-sm text-gray-200">{player.name}</span>
                          {player.role && (
                            <span className="text-xs text-gray-500">({player.role})</span>
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Children count badge */}
              {hasChildren && (
                <span className="text-xs text-gray-500 bg-game-dark/50 px-2 py-0.5 rounded">
                  {children.length} sub-items
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Children */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 space-y-2 border-l-2 border-white/5 ml-4"
          >
            {children.map(child => (
              <Domino
                key={child.template_id}
                assignment={child}
                children={child.children || []}
                depth={depth + 1}
                onDetailClick={onDetailClick}
                onAssignPlayer={onAssignPlayer}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Click outside to close player menu */}
      {showPlayerMenu && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowPlayerMenu(false)}
        />
      )}
    </div>
  );
};

export default Domino;
