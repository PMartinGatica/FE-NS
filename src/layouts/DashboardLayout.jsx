// frontend/src/components/DashboardLayout.jsx
import { useState, useEffect } from 'react';
import { X, Menu } from 'react-feather'; // Importar íconos necesarios
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import DailyControlsTable from '../components/DailyControlsTable';
import OrganizationChart from '../components/OrganizationChart';
import DocumentsPage from '../pages/Documentos';
import LaunchesPage from '../pages/Lanzamientos';
import TrainingPage from '../pages/Formacion';

const DashboardLayout = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('inicio');
  const [topFailures, setTopFailures] = useState([]); // Estado para almacenar métricas Prime y NTF
  const [collapsed, setCollapsed] = useState(() => {
    return JSON.parse(localStorage.getItem('sidebarCollapsed')) || false;
  });

  // Define los estilos faltantes
  const inactiveTextColor = 'text-gray-500'; // Color de texto inactivo
  const hoverBg = 'hover:bg-gray-200'; // Fondo al pasar el mouse

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

  // Función para obtener los datos de la API y calcular métricas Prime y NTF
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/mqs/');
        if (!res.ok) throw new Error(`Error en la solicitud: ${res.status}`);
        const data = await res.json();

        // Agrupar por Testcode + Family
        const map = {};
        data.forEach(item => {
          const key = `${item.Testcode}||${item.Family}`;
          if (!map[key]) {
            map[key] = {
              testcode: item.Testcode,
              family: item.Family,
              primeCount: 0,
              ntfCount: 0,
            };
          }
          if (item.Prime) map[key].primeCount += 1;
          if (item.NTF) map[key].ntfCount += 1;
        });

        // Obtener el top 1 de cada Family (el Testcode con más Prime)
        const familyMap = {};
        Object.values(map).forEach(row => {
          const fam = row.family;
          if (
            !familyMap[fam] ||
            row.primeCount > familyMap[fam].primeCount
          ) {
            familyMap[fam] = row;
          }
        });

        // Ordenar de mayor a menor por primeCount
        const topByFamily = Object.values(familyMap).sort(
          (a, b) => b.primeCount - a.primeCount
        );

        setTopFailures(topByFamily);
      } catch (err) {
        console.error('Error al cargar MQS:', err);
      }
    };

    fetchMetrics();
  }, []);

  const PrimeNtfTable = ({ data }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-gray-500 uppercase">
            <th className="pb-1 pr-2 font-medium">Testcode</th>
            <th className="pb-1 pr-2 font-medium">Family</th>
            <th className="pb-1 pr-2 font-medium">Prime</th>
            <th className="pb-1 pr-2 font-medium">NTF</th>
          </tr>
        </thead>
        <tbody>
          {data.map(({ testcode, family, primeCount, ntfCount }, i) => (
            <tr key={i} className="border-t border-gray-100">
              <td className="py-1.5 pr-2 font-medium text-gray-600">{testcode}</td>
              <td className="py-1.5 pr-2 text-gray-600">{family}</td>
              <td className="py-1.5 pr-2 text-gray-600">{primeCount}</td>
              <td className="py-1.5 pr-2 text-gray-600">{ntfCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPageContent = () => {
    const Card = ({ title, children }) => (
      <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
        <h3 className="text-md font-semibold mb-3 text-gray-700">{title}</h3>
        {children}
      </div>
    );

    switch (activePage) {
      case 'inicio':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <Card title="Metrics Prime / NTF por Línea">
                <PrimeNtfTable data={topFailures} />
              </Card>
            </div>
            <DailyControlsTable />
            <OrganizationChart />
          </>
        );
      case 'documentos':
        return <DocumentsPage currentUser={user} />;
      case 'controles':
        return <Card title="Registrar Control">Formulario de controles</Card>;
      case 'reportes':
        return <Card title="Visualizar Reportes">Panel de reportes</Card>;
      case 'lanzamientos':
        return <LaunchesPage currentUser={user} />;
      case 'formacion':
        return <TrainingPage currentUser={user} />;
      default:
        return <Card title="Página no encontrada">No implementada</Card>;
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
          {renderPageContent()}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
