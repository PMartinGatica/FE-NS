import React, { useState } from 'react';
// Importaciones de íconos (asegúrate de instalarlos e importarlos correctamente)
import { Search, Filter, ExternalLink, LinkIcon, FileText, Download, UploadCloud } from 'react-feather'; // o 'lucide-react' o el paquete que uses

// Componentes UI reutilizables
const Table = ({ children }) => (
  <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
    <table className="min-w-full divide-y divide-gray-200">{children}</table>
  </div>
);

const TableHeader = ({ children }) => <thead className="bg-gray-50">{children}</thead>;
const TableBody = ({ children }) => <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>;
const TableRow = ({ children, className = "", onClick }) => (
  <tr 
    className={`hover:bg-gray-50 ${onClick ? 'cursor-pointer' : ''} ${className}`} 
    onClick={onClick}
  >
    {children}
  </tr>
);

const TableHead = ({ children, className = "" }) => (
  <th 
    scope="col" 
    className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
  >
    {children}
  </th>
);

const TableCell = ({ children, className = "" }) => (
  <td className={`px-4 py-3 whitespace-nowrap text-sm text-gray-700 ${className}`}>
    {children ?? '-'}
  </td>
);

const Input = (props) => (
  <input 
    {...props} 
    className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E30613] focus:border-transparent transition duration-150 ease-in-out ${props.className}`} 
  />
);

const Button = ({ children, className = "", ...props }) => (
  <button 
    {...props} 
    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out ${className}`}
  >
    {children}
  </button>
);

// Componente principal
const DocumentsPage = ({ currentUser }) => {
  const [selectedDocId, setSelectedDocId] = useState(null);
  
  // Datos para la UI
  const newsanRed = '#E30613';
  const newsanRedDarker = '#B80510';
  const isAdmin = currentUser?.role === 'Administrador';
  
  // Datos de muestra
  const sampleDocuments = [
    { 
      id: 1, 
      title: 'Instructivo Ensamble Modelo Lamu v1.2', 
      version: '1.2', 
      category: 'Instructivos Ensamble', 
      uploadedAt: '2025-04-10', 
      uploadedBy: 'Admin QC' 
    },
    { 
      id: 2, 
      title: 'Especificación Técnica Display LGE-07', 
      version: '2.0', 
      category: 'Especificaciones Técnicas', 
      uploadedAt: '2025-04-08', 
      uploadedBy: 'Admin QC' 
    },
    { 
      id: 3, 
      title: 'Procedimiento Auditoría OQC', 
      version: '3.1', 
      category: 'Procedimientos', 
      uploadedAt: '2025-04-05', 
      uploadedBy: 'Admin QC' 
    }
  ];
  
  const quickLinks = [
    { 
      name: 'Especificaciones cosméticas para Celulares (Pixels, Rayas, Suciedad, etc.)', 
      url: 'http://isokey/isokey/IKBase.aspx?VIEW=DOCITEM&DOCCODE=4201&STATUS=2', 
      type: 'internal' 
    },
    { 
      name: 'Especificaciones cosméticas (Traducido)', 
      url: 'https://drive.google.com/file/d/1mMk1GEB-iMh7zSAo915lCisL5DCZyuFA/view', 
      type: 'external' 
    },
    { 
      name: 'Ingeniería de Producto', 
      url: 'https://drive.google.com/drive/folders/1YOgQ7gRw3YYgkXYCrptwAChex13qYhAk', 
      type: 'external' 
    },
    { 
      name: 'Realizar AMFE', 
      url: 'http://isokey/isokey/IKBase.aspx?VIEW=DOCITEM&DOCCODE=2306&STATUS=2', 
      type: 'internal' 
    }
  ];

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Input type="text" placeholder="Buscar en biblioteca (ej: Lamu, OQC...)" className="w-full pl-10" />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <p className="text-xs text-gray-500 mt-1 italic">
            (En la versión final, al escribir 3+ letras se mostrarán sugerencias)
          </p>
        </div>
        <Button className={`bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-[${newsanRed}]`}>
          <Filter className="w-4 h-4 mr-2" /> Filtros
        </Button>
      </div>

      {/* Encabezado y botón de carga */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900">Biblioteca de Documentos</h1>
        {isAdmin && (
          <Button 
            style={{ '--newsan-red': newsanRed, '--newsan-red-darker': newsanRedDarker }}
            className={`bg-[var(--newsan-red)] text-white hover:bg-[var(--newsan-red-darker)] focus:ring-[var(--newsan-red)]`}
          >
            <UploadCloud className="w-4 h-4 mr-2" /> Cargar Nuevo Documento
          </Button>
        )}
      </div>

      {/* Enlaces rápidos */}
      <div className="p-4 bg-white rounded-lg shadow border border-gray-100">
        <h3 className="text-md font-semibold mb-3 text-gray-700">Documentos Clave / Enlaces Rápidos</h3>
        <ul className="space-y-2">
          {quickLinks.map((link, index) => (
            <li key={index} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
              <a 
                href={link.url} 
                target={link.type === 'external' ? '_blank' : '_self'} 
                rel={link.type === 'external' ? 'noopener noreferrer' : ''}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                {link.type === 'external' ? 
                  <ExternalLink className="w-4 h-4 mr-2 flex-shrink-0"/> : 
                  <LinkIcon className="w-4 h-4 mr-2 flex-shrink-0"/>
                }
                {link.name}
              </a>
              {link.type === 'internal' && (
                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">Intranet</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Vista detallada del documento seleccionado */}
      {selectedDocId && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-800">
          Vista detallada del documento ID: {selectedDocId} (incluiría metadatos y visor PDF aquí).
          <button 
            onClick={() => setSelectedDocId(null)} 
            className="ml-4 text-xs font-semibold underline"
          >
            Cerrar detalle
          </button>
        </div>
      )}

      {/* Tabla de documentos */}
      <h3 className="text-lg font-semibold text-gray-800 pt-4">Biblioteca Completa</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead className="w-20">Versión</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Fecha Carga</TableHead>
            <TableHead className="w-24">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sampleDocuments.map((doc) => (
            <TableRow key={doc.id} onClick={() => setSelectedDocId(doc.id)}>