import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsAndConditions from './components/TermsAndConditions';

function App() {
  return (
    <Router>
      <div className="bg-deep-black min-h-screen text-white relative overflow-x-hidden selection:bg-amber-gold selection:text-black scroll-smooth">
        <Routes>
          <Route path="/" element={<TermsAndConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
