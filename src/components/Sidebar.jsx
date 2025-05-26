import React from 'react';
import { Home, CheckSquare, BarChart, Zap, Folder, BookOpen, X, Menu } from 'react-feather';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';

const Sidebar = ({
  collapsed,
  toggleCollapsed,
  activePage,
  currentUser
}) => {
  // *** Colores Sidebar: Gris Oscuro ***
  const sidebarBg = 'bg-gray-800'; // Gris oscuro principal
  const borderColor = 'border-gray-700'; // Borde ligeramente más claro/oscuro
  const hoverBg = 'hover:bg-gray-700'; // Hover un poco más claro
  const activeBg = 'bg-gray-900'; // Activo más oscuro
  const textColor = 'text-white'; // Texto principal blanco
  const inactiveTextColor = 'text-gray-300'; // Texto inactivo ligeramente más apagado
  const activeTextColor = 'text-white'; // Texto activo blanco
  const iconColor = 'text-gray-400'; // Iconos inactivos
  const activeIconColor = 'text-white'; // Iconos activos

  const allMenuItems = [
    { name: 'Inicio', icon: Home, page: 'inicio', roles: ['Analista', 'Administrador'] },
    { name: 'Controles', icon: CheckSquare, page: 'controles', roles: ['Analista', 'Administrador'] },
    { name: 'Reportes', icon: BarChart, page: 'reportes', roles: ['Analista', 'Administrador'] },
    { name: 'Lanzamientos', icon: Zap, page: 'lanzamientos', roles: ['Analista', 'Administrador'] },
    { name: 'Documentos', icon: Folder, page: 'documentos', roles: ['Analista', 'Administrador'] },
    { name: 'Formación', icon: BookOpen, page: 'formacion', roles: ['Analista', 'Administrador'] },
  ];

  const visibleMenuItems = allMenuItems.filter((item) =>
    item.roles.includes(currentUser?.role || '')
  );

  return (
    <motion.div
      initial={{ width: collapsed ? 80 : 256 }}
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ duration: 0.3 }}
      className={`fixed inset-y-0 left-0 z-30 flex flex-col flex-shrink-0 ${sidebarBg} ${textColor} shadow-lg`}
    >
      <div className={`flex items-center justify-between h-20 px-4 border-b ${borderColor}`}>
        {!collapsed && (
          <img
            src="public/newsan_logo.svg"
            alt="Logo Newsan Clave"
            className="h-10 w-auto max-w-[140px] object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/150x40/ffffff/cccccc?text=NEWSAN';
            }}
          />
        )}
        <button
          onClick={toggleCollapsed}
          className={`p-1 rounded-md ${inactiveTextColor} hover:text-white ${hoverBg} focus:outline-none focus:ring-2 focus:ring-white`}
          aria-label="Colapsar menú"
        >
          {collapsed ? <Menu className="w-6 h-6" /> : <X className="w-6 h-6" />}
        </button>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.page}
              to={item.page === 'inicio' ? '/' : `/${item.page}`}
              className={({ isActive }) =>
                `flex items-center w-full px-4 py-3 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out ${
                  isActive
                    ? `${activeBg} ${activeTextColor}`
                    : `${inactiveTextColor} ${hoverBg} hover:text-white`
                }`
              }
            >
              <Icon className={`${collapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`} />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>
      {!collapsed && (
        <div className={`px-4 py-4 border-t ${borderColor} text-center text-xs ${iconColor}`}>
          Plataforma Calidad v1.0
        </div>
      )}
    </motion.div>
  );
};

export default Sidebar;