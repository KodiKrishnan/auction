import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';



// Importing your routing logic
import AppRouters from './routes/AppRouters';

function App() {
  return (
    <Router>
      <AppRouters />
    </Router>
  );
}

export default App;