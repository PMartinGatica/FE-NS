// frontend/src/components/DashboardLayout.jsx
import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ContenidoTablero from '../componentes/ContenidoTablero';

const DashboardLayout = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('inicio');
  const [collapsed, setCollapsed] = useState(() => {
    return JSON.parse(localStorage.getItem('sidebarCollapsed')) || false;
  });

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

  const handleSetActivePage = (page) => {
    setActivePage(page);
    if (window.innerWidth < 768 && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar
        collapsed={collapsed}
        toggleCollapsed={toggleCollapsed}
        activePage={activePage}
        setActivePage={handleSetActivePage}
        currentUser={user}
      />
      <div
        className="flex flex-col flex-1 overflow-hidden transition-all duration-300"
        style={{ marginLeft: collapsed ? 80 : 256 }}
      >
        <Header toggleSidebar={toggleSidebar} activePage={activePage} currentUser={user} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6 lg:p-8">
          <ContenidoTablero activePage={activePage} user={user} />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
