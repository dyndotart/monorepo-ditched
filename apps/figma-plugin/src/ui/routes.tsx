import React from 'react';
import { Route, Routes as RouterRoutes } from 'react-router-dom';

// Routes
import About from './routes/about';
import Home from './routes/home';

const Routes: React.FC = () => {
  return (
    <div>
      <RouterRoutes>
        <Route path="/" element={<Home />} />
        <Route path="about" element={<About />} />
      </RouterRoutes>
    </div>
  );
};

export default Routes;