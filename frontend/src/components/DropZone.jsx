import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { CheckCircle, HelpCircle, AlertCircle, Inbox } from 'lucide-react';

const pileConfig = {
  handled: {
    title: 'Handled',
    subtitle: "We've got this covered",
    icon: CheckCircle,
    className: 'pile-handled',
    iconColor: 'text-pile-handled',
  },
  need_help: {
    title: 'Need Help',
    subtitle: 'ITernative can assist',
    icon: HelpCircle,
    className: 'pile-need-help',
    iconColor: 'text-pile-need-help',
  },
  unknown: {
    title: 'Unknown',
    subtitle: "We'll figure this out later",
    icon: AlertCircle,
    className: 'pile-unknown',
    iconColor: 'text-pile-unknown',
  },
  unassigned: {
    title: 'Responsibilities',
    subtitle: 'Drag items to sort them',
    icon: Inbox,
    className: 'border-white/20 bg-white/5',
    iconColor: 'text-gray-400',
  },
};

const DropZone = ({ 
  id, 
  children, 
  count = 0,
  isEmpty = true,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: 'pile', pile: id },
  });
  
  const config = pileConfig[id] || pileConfig.unassigned;
  const Icon = config.icon;
  
  return (
    <div
      ref={setNodeRef}
      className={`
        pile-zone ${config.className}
        ${isOver ? 'pile-zone-active' : ''}
        flex flex-col
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className={`${config.iconColor}`} size={20} />
          <div>
            <h3 className="font-semibold text-white">{config.title}</h3>
            <p className="text-xs text-gray-400">{config.subtitle}</p>
          </div>
        </div>
        <span className="text-2xl font-bold text-white/50">{count}</span>
      </div>
      
      {/* Drop area */}
      <div className="flex-1 space-y-2 min-h-[100px]">
        {isEmpty ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`
              h-full flex items-center justify-center rounded-xl
              border border-dashed border-white/10
              ${isOver ? 'border-white/30 bg-white/5' : ''}
              transition-all duration-200
            `}
          >
            <p className="text-gray-500 text-sm">
              {isOver ? 'Drop here!' : 'Drag items here'}
            </p>
          </motion.div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default DropZone;
