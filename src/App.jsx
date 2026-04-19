import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Terms from './pages/Terms';
import PrivacyPolicy from './pages/PrivacyPolicy';

// Global Styles (Consolidated)
import './index.css';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Terms />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dialect-bg text-dialect-text antialiased">
        <AnimatedRoutes />
      </div>
    </Router>
  );
}

export default App;
