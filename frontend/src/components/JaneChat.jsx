import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Volume2, VolumeX, Sparkles } from 'lucide-react';
import useGameStore from '../store/gameStore';

const API_BASE = '/api';

const JaneChat = () => {
  const { isJaneChatOpen, toggleJaneChat, closeJaneChat, session, selectedItem } = useGameStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Load initial greeting
  useEffect(() => {
    if (isJaneChatOpen && messages.length === 0) {
      loadGreeting();
    }
  }, [isJaneChatOpen]);
  
  const loadGreeting = async () => {
    setIsTyping(true);
    try {
      const response = await fetch(`${API_BASE}/jane/intro`);
      const data = await response.json();
      
      setTimeout(() => {
        setMessages([{
          role: 'jane',
          content: data.message,
        }]);
        setIsTyping(false);
      }, 500);
    } catch (error) {
      setIsTyping(false);
    }
  };
  
  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);
    
    try {
      const response = await fetch(`${API_BASE}/jane/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session?.id,
          question: userMessage,
          context: selectedItem ? { item_id: selectedItem } : null,
        }),
      });
      
      const data = await response.json();
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'jane',
          content: data.message,
          suggestions: data.suggestions,
        }]);
        setIsTyping(false);
      }, 500 + Math.random() * 500);
      
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'jane',
        content: "Hmm, something went wrong on my end. Try again?",
      }]);
      setIsTyping(false);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };
  
  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isJaneChatOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={toggleJaneChat}
            className="jane-bubble"
          >
            <MessageCircle className="text-white" size={24} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full 
                           border-2 border-game-dark animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>
      
      {/* Chat panel */}
      <AnimatePresence>
        {isJaneChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-96 h-[500px] 
                       bg-game-surface border border-white/10 rounded-2xl 
                       shadow-game-lg flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-orange flex items-center justify-center">
                  <Sparkles className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Jane</h3>
                  <p className="text-xs text-gray-400">Your IT Guide</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <button
                  onClick={closeJaneChat}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-brand-orange text-white rounded-br-sm'
                        : 'bg-game-dark text-gray-200 rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    
                    {/* Suggestions */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {msg.suggestions.map((suggestion, j) => (
                          <button
                            key={j}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-xs px-2 py-1 bg-white/10 rounded-full 
                                       hover:bg-white/20 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-game-dark p-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                            style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                            style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                            style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Jane anything..."
                  className="input-field flex-1 py-2"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="p-2 bg-brand-orange text-white rounded-xl 
                             hover:bg-brand-orange-light transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default JaneChat;
