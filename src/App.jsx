// frontend/src/App.jsx
import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen'; // Pantalla de inicio de sesión
import WelcomeMessage from './components/WelcomeMessage'; // Mensaje de bienvenida
import DashboardLayout from './layouts/DashboardLayout'; // Layout principal del dashboard

function App() {
  const [isAuthenticated, setAuth] = useState(false);
  const [currentUser, setUser] = useState(null);
  const [showWelcome, setWelcome] = useState(false);

  const handleLogin = (u, p) => {
    if (u === 'usuario@newsan.com.ar' && p === '1234') {
      setUser({ name: 'Pablo Gática', role: 'Analista' });
      setAuth(true);
      setWelcome(true);
      return true;
    }
    return false;
  };

  if (!isAuthenticated)
    return <LoginScreen onLogin={handleLogin} />;
  if (showWelcome)
    return <WelcomeMessage user={currentUser} onFadeComplete={() => setWelcome(false)} />;
  return <DashboardLayout user={currentUser} />;
}

export default App;
