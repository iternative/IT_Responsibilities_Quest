import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DndContext, 
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { 
  Menu, 
  Users, 
  LayoutGrid, 
  List, 
  Flag,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import useGameStore from '../store/gameStore';
import Domino from '../components/Domino';
import DropZone from '../components/DropZone';
import JaneChat from '../components/JaneChat';
import DetailPanel from '../components/DetailPanel';
import PlayerManager from '../components/PlayerManager';

const GameBoard = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const {
    session,
    client,
    assignments,
    players,
    stats,
    pathChosen,
    loadSession,
    moveToFile,
    assignPlayer,
    isLoading,
  } = useGameStore();
  
  const [viewMode, setViewMode] = useState('pile'); // 'pile' or 'tree'
  const [activeId, setActiveId] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [showPlayers, setShowPlayers] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  
  // Load session if not already loaded
  useEffect(() => {
    if (!session && token) {
      loadSession(token);
    }
  }, [token, session]);
  
  // Build hierarchical structure from assignments
  const { rootItems, itemsByPile, itemsById } = useMemo(() => {
    const byId = {};
    const roots = [];
    const byPile = {
      handled: [],
      need_help: [],
      unknown: [],
      unassigned: [],
    };
    
    // First pass: create lookup
    assignments.forEach(a => {
      byId[a.template_id] = { ...a, children: [] };
    });
    
    // Second pass: build hierarchy
    assignments.forEach(a => {
      if (a.parent_id && byId[a.parent_id]) {
        byId[a.parent_id].children.push(byId[a.template_id]);
      } else if (!a.parent_id) {
        roots.push(byId[a.template_id]);
      }
      
      // Only add root items to piles
      if (!a.parent_id) {
        byPile[a.pile]?.push(byId[a.template_id]);
      }
    });
    
    // Sort by template_sort_order
    roots.sort((a, b) => (a.template_sort_order || 0) - (b.template_sort_order || 0));
    Object.values(byPile).forEach(pile => {
      pile.sort((a, b) => (a.template_sort_order || 0) - (b.template_sort_order || 0));
    });
    
    return { rootItems: roots, itemsByPile: byPile, itemsById: byId };
  }, [assignments]);
  
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };
  
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over) return;
    
    const templateId = active.id;
    const targetPile = over.id;
    
    // Validate target is a pile
    if (!['handled', 'need_help', 'unknown', 'unassigned'].includes(targetPile)) {
      return;
    }
    
    // Move the item and its children
    moveToFile(templateId, targetPile);
  };
  
  const handleDetailClick = (assignment) => {
    setDetailItem(assignment);
  };
  
  const handleAssignPlayer = (templateId, playerId) => {
    assignPlayer(templateId, playerId);
  };
  
  const handleFinish = () => {
    navigate(`/play/${token}/complete`);
  };
  
  const activeItem = activeId ? itemsById[activeId] : null;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-brand-orange border-t-transparent 
                        rounded-full animate-spin" />
      </div>
    );
  }
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-game-darker/95 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            {/* Left: Logo and title */}
            <div className="flex items-center gap-4">
              {client.logo_url ? (
                <img src={client.logo_url} alt={client.name} className="h-8 object-contain" />
              ) : (
                <span className="font-bold text-white">{client.name}</span>
              )}
              <div className="hidden md:block">
                <h1 className="text-lg font-semibold text-white">Responsibility Quest</h1>
              </div>
            </div>
            
            {/* Center: Progress */}
            <div className="flex-1 max-w-md mx-8 hidden md:block">
              <div className="flex items-center gap-3">
                <div className="flex-1 progress-bar">
                  <motion.div 
                    className="progress-fill"
                    animate={{ width: `${stats.progress}%` }}
                  />
                </div>
                <span className="text-sm text-gray-400 min-w-[60px]">
                  {stats.progress}% sorted
                </span>
              </div>
            </div>
            
            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPlayers(true)}
                className="btn-ghost flex items-center gap-2"
              >
                <Users size={18} />
                <span className="hidden md:inline">Players</span>
              </button>
              
              <div className="hidden md:flex items-center bg-game-dark rounded-lg p-1">
                <button
                  onClick={() => setViewMode('pile')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'pile' ? 'bg-brand-orange text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('tree')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'tree' ? 'bg-brand-orange text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List size={18} />
                </button>
              </div>
              
              <button
                onClick={handleFinish}
                className="btn-primary flex items-center gap-2"
              >
                <Flag size={18} />
                <span className="hidden md:inline">Finish</span>
              </button>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {viewMode === 'pile' ? (
              // Pile view - drop zones
              <div className="grid lg:grid-cols-4 gap-4">
                {/* Unassigned pile */}
                <div className="lg:col-span-1">
                  <DropZone
                    id="unassigned"
                    count={itemsByPile.unassigned.length}
                    isEmpty={itemsByPile.unassigned.length === 0}
                  >
                    <div className="space-y-2">
                      {itemsByPile.unassigned.map(item => (
                        <Domino
                          key={item.template_id}
                          assignment={item}
                          children={item.children}
                          onDetailClick={handleDetailClick}
                          onAssignPlayer={handleAssignPlayer}
                        />
                      ))}
                    </div>
                  </DropZone>
                </div>
                
                {/* Sorted piles */}
                <div className="lg:col-span-3 grid md:grid-cols-3 gap-4">
                  <DropZone
                    id="handled"
                    count={itemsByPile.handled.length}
                    isEmpty={itemsByPile.handled.length === 0}
                  >
                    <div className="space-y-2">
                      {itemsByPile.handled.map(item => (
                        <Domino
                          key={item.template_id}
                          assignment={item}
                          children={item.children}
                          onDetailClick={handleDetailClick}
                          onAssignPlayer={handleAssignPlayer}
                        />
                      ))}
                    </div>
                  </DropZone>
                  
                  <DropZone
                    id="need_help"
                    count={itemsByPile.need_help.length}
                    isEmpty={itemsByPile.need_help.length === 0}
                  >
                    <div className="space-y-2">
                      {itemsByPile.need_help.map(item => (
                        <Domino
                          key={item.template_id}
                          assignment={item}
                          children={item.children}
                          onDetailClick={handleDetailClick}
                          onAssignPlayer={handleAssignPlayer}
                        />
                      ))}
                    </div>
                  </DropZone>
                  
                  <DropZone
                    id="unknown"
                    count={itemsByPile.unknown.length}
                    isEmpty={itemsByPile.unknown.length === 0}
                  >
                    <div className="space-y-2">
                      {itemsByPile.unknown.map(item => (
                        <Domino
                          key={item.template_id}
                          assignment={item}
                          children={item.children}
                          onDetailClick={handleDetailClick}
                          onAssignPlayer={handleAssignPlayer}
                        />
                      ))}
                    </div>
                  </DropZone>
                </div>
              </div>
            ) : (
              // Tree view - hierarchical list
              <div className="glass-card p-6 rounded-2xl">
                <div className="space-y-4">
                  {rootItems.map(item => (
                    <Domino
                      key={item.template_id}
                      assignment={item}
                      children={item.children}
                      onDetailClick={handleDetailClick}
                      onAssignPlayer={handleAssignPlayer}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
        
        {/* Stats bar (mobile) */}
        <div className="md:hidden sticky bottom-0 bg-game-darker/95 backdrop-blur-xl 
                        border-t border-white/10 p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-pile-handled">✓ {stats.handled}</span>
              <span className="text-pile-need-help">? {stats.need_help}</span>
              <span className="text-pile-unknown">⚪ {stats.unknown}</span>
            </div>
            <span className="text-gray-400">{stats.progress}% complete</span>
          </div>
        </div>
        
        {/* Drag overlay */}
        <DragOverlay>
          {activeItem && (
            <div className="domino domino-dragging opacity-90">
              <h3 className="font-medium text-white">{activeItem.title}</h3>
            </div>
          )}
        </DragOverlay>
        
        {/* Jane chat */}
        <JaneChat />
        
        {/* Detail panel */}
        <DetailPanel
          isOpen={!!detailItem}
          onClose={() => setDetailItem(null)}
          assignment={detailItem}
        />
        
        {/* Player manager */}
        <PlayerManager
          isOpen={showPlayers}
          onClose={() => setShowPlayers(false)}
        />
      </div>
    </DndContext>
  );
};

export default GameBoard;
