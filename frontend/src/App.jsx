import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Pages
import Landing from './pages/Landing';
import Intro from './pages/Intro';
import Profile from './pages/Profile';
import PathSelect from './pages/PathSelect';
import GameBoard from './pages/GameBoard';
import Completion from './pages/Completion';
import NotFound from './pages/NotFound';

// Components
import NoiseOverlay from './components/NoiseOverlay';

function App() {
  return (
    <>
      <NoiseOverlay />
      <AnimatePresence mode="wait">
        <Routes>
          {/* Play route - main game flow */}
          <Route path="/play/:token" element={<Landing />} />
          <Route path="/play/:token/intro" element={<Intro />} />
          <Route path="/play/:token/profile" element={<Profile />} />
          <Route path="/play/:token/path" element={<PathSelect />} />
          <Route path="/play/:token/game" element={<GameBoard />} />
          <Route path="/play/:token/complete" element={<Completion />} />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/play/demo" replace />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;
