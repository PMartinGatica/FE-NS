import React from 'react';
import { Menu, User } from 'react-feather'; // Importación de íconos

const Header = ({ toggleSidebar, activePage, currentUser }) => {
  const pageTitles = {
    inicio: 'Inicio',
    controles: 'Controles de Calidad',
    reportes: 'Reportes',
    lanzamientos: 'Gestión de Lanzamientos',
    documentos: 'Documentación',
    formacion: 'Formación',
  };

  const newsanRed = '#E30613'; // Mantener rojo para focus ring

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className={`md:hidden mr-4 p-2 -ml-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[${newsanRed}]`}
          aria-label="Abrir menú"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">
          {pageTitles[activePage] || 'Panel de Control'}
        </h1>
      </div>
      <div className="flex items-center space-x-3">
        <span className="hidden sm:inline text-sm text-gray-600 font-medium">
          {currentUser?.name || 'Usuario'}
        </span>
        <div className="p-1.5 bg-gray-100 rounded-full border border-gray-200">
          <User className="h-5 w-5 text-gray-600" />
        </div>
      </div>
    </header>
  );
};

export default Header;