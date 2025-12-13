import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import OverlayView from './features/display/OverlayView';
import { ProjectionProvider } from './context/ProjectionContext';
import MainLayout from './layout/MainLayout';

function App() {
  return (
    <BrowserRouter>
      <ProjectionProvider>
        <Routes>
          {/* Main Interface (Tabs) */}
          <Route path="/" element={<MainLayout />} />

          {/* Projector View (Unchanged) */}
          <Route path="/overlay" element={<OverlayView />} />
        </Routes>
      </ProjectionProvider>
    </BrowserRouter>
  );
}

export default App;