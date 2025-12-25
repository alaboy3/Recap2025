import React from 'react';
import { AppProvider } from './context/AppContext';
import { Desktop } from './components/Desktop';
import './styles/global.css';

function App() {
  return (
    <AppProvider>
      <Desktop />
    </AppProvider>
  );
}

export default App;

