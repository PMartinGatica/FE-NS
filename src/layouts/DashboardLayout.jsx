// frontend/src/components/DashboardLayout.jsx
import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ContenidoTablero from '../components/ContenidoTablero';
import Reportes from '../pages/Reportes';

const DashboardLayout = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    return JSON.parse(localStorage.getItem('sidebarCollapsed')) || false;
  });
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
      return newState;
    });
  };

  // Determinar la página activa basada en la ruta actual
  const getActivePage = () => {
    const path = location.pathname;
    if (path === '/') return 'inicio';
    return path.substring(1); // Elimina la barra inicial
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar
        collapsed={collapsed}
        toggleCollapsed={toggleCollapsed}
        activePage={getActivePage()}
        currentUser={user}
      />
      <div
        className="flex flex-col flex-1 overflow-hidden transition-all duration-300"
        style={{ marginLeft: collapsed ? 80 : 256 }}
      >
        <Header toggleSidebar={toggleSidebar} activePage={getActivePage()} currentUser={user} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<ContenidoTablero activePage="inicio" user={user} />} />
            <Route path="/inicio" element={<ContenidoTablero activePage="inicio" user={user} />} />
            <Route path="/reportes" element={<Reportes />} />
            {/* Añadir más rutas según sea necesario */}
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
