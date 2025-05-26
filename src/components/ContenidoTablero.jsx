import React, { useState, useEffect, useMemo } from 'react';
import Tarjeta from './Tarjeta';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveHeatMap } from '@nivo/heatMap';
import { ResponsiveCalendar } from '@nivo/calendar';
import { ResponsiveRadar } from '@nivo/radar';

// Importación de hooks
import useMQS from '../hooks/useMQS';
import useMes from '../hooks/useMes';
import useYield from '../hooks/useYield';

// Componente de carga con el GIF personalizado
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-4">
    <img 
      src="/logonewsnacarga.gif" 
      alt="Cargando..." 
      className="w-16 h-16"
    />
  </div>
);

// Filtros globales modificados (sin filtro de línea)
const GlobalFilters = ({ filters, setFilters, families }) => (
  <div className="sticky top-0 z-10 bg-white shadow-md p-4 mb-6 border-b border-gray-200">
    <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Family</label>
        <select 
          name="family"
          value={filters.family}
          onChange={(e) => setFilters({...filters, family: e.target.value})}
          className="w-full border border-gray-300 rounded-md p-2 text-sm"
        >
          {families.map(family => (
            <option key={family} value={family}>{family}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
        <input 
          type="date" 
          name="startDate"
          value={filters.startDate}
          onChange={(e) => setFilters({...filters, startDate: e.target.value})}
          className="w-full border border-gray-300 rounded-md p-2 text-sm"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
        <input 
          type="date" 
          name="endDate"
          value={filters.endDate}
          onChange={(e) => setFilters({...filters, endDate: e.target.value})}
          className="w-full border border-gray-300 rounded-md p-2 text-sm"
        />
      </div>
    </div>
  </div>
);

// Definición del componente MQSFailuresChart que faltaba
const MQSFailuresChart = ({ data, filters }) => {
  const filteredData = useMemo(() => {
    if (!data) return [];
    
    return data.filter(item => {
      // Filtrar por fecha si hay fecha disponible
      if (item.date) {
        const itemDate = new Date(item.date);
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        if (itemDate < startDate || itemDate > endDate) return false;
      }
      
      // Filtrar por familia
      const matchesFamily = filters.family === 'Todas' || item.Family === filters.family;
      
      return matchesFamily;
    });
  }, [data, filters]);

  // Top 10 failures
  const chartData = useMemo(() => {
    if (!filteredData || !filteredData.length) return [];
    
    // Agrupar por código/descripción de falla
    const failureCounts = {};
    
    filteredData.forEach(item => {
      const failureCode = item.Testcode_Desc || item.Testcode || 'Unknown';
      
      if (!failureCounts[failureCode]) {
        failureCounts[failureCode] = 0;
      }
      
      failureCounts[failureCode] += 1;
    });
    
    // Convertir a formato para gráfico y ordenar
    return Object.entries(failureCounts)
      .map(([failureCode, count]) => ({
        failureCode: failureCode.substring(0, 25) + (failureCode.length > 25 ? '...' : ''),
        originalCode: failureCode,
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10
  }, [filteredData]);

  return (
    <div style={{ height: 400 }}>
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No hay datos para los filtros seleccionados</p>
        </div>
      ) : (
        <ResponsiveBar
          data={chartData}
          keys={['count']}
          indexBy="failureCode"
          margin={{ top: 50, right: 50, bottom: 100, left: 60 }}
          padding={0.3}
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={{ scheme: 'nivo' }}
          borderWidth={1}
          borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 45,
            legend: 'Código de Falla',
            legendPosition: 'middle',
            legendOffset: 80
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Frecuencia',
            legendPosition: 'middle',
            legendOffset: -50
          }}
          tooltip={({ data }) => (
            <div style={{
              padding: '10px',
              background: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
            }}>
              <strong>Falla: {data.originalCode}</strong><br/>
              Cantidad: {data.count}
            </div>
          )}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
          animate={true}
          motionStiffness={90}
          motionDamping={15}
        />
      )}
    </div>
  );
};

// Gráfico de FTY promedio por línea a lo largo de días
const FTYLineChart = ({ data, filters }) => {
  const filteredData = useMemo(() => {
    if (!data) return [];
    
    return data.filter(item => {
      // Filtrar por fecha
      const itemDate = new Date(item.date || '2000-01-01');
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      const isDateInRange = itemDate >= startDate && itemDate <= endDate;
      
      // Filtrar por family
      const matchesFamily = filters.family === 'Todas' || item.Family === filters.family;
      
      return isDateInRange && matchesFamily;
    });
  }, [data, filters]);

  // Preparar datos para gráfico de línea agrupado por línea
  const chartData = useMemo(() => {
    if (!filteredData.length) return [];
    
    // Agrupar por línea y por fecha
    const linesByDate = {};
    
    filteredData.forEach(item => {
      const line = item.Line || 'Unknown';
      const date = new Date(item.date || '2000-01-01').toISOString().split('T')[0];
      
      if (!linesByDate[line]) {
        linesByDate[line] = {};
      }
      
      if (!linesByDate[line][date]) {
        linesByDate[line][date] = { sum: 0, count: 0 };
      }
      
      linesByDate[line][date].sum += parseFloat(item.FTY || 0);
      linesByDate[line][date].count += 1;
    });
    
    // Convertir a formato para gráfico de línea
    return Object.entries(linesByDate).map(([line, dates]) => {
      const dataPoints = Object.entries(dates).map(([date, values]) => ({
        x: date,
        y: values.sum / values.count // Promedio FTY para esta línea en esta fecha
      })).sort((a, b) => a.x.localeCompare(b.x));
      
      return {
        id: line,
        data: dataPoints
      };
    });
  }, [filteredData]);

  return (
    <div style={{ height: 400 }}>
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No hay datos para los filtros seleccionados</p>
        </div>
      ) : (
        <ResponsiveLine
          data={chartData}
          margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
          xScale={{ type: 'point' }}
          yScale={{ 
            type: 'linear', 
            min: 'auto', 
            max: 'auto', 
            stacked: false, 
            reverse: false 
          }}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 45,
            legend: 'Fecha',
            legendOffset: 36,
            legendPosition: 'middle'
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'FTY Promedio (%)',
            legendOffset: -40,
            legendPosition: 'middle'
          }}
          colors={{ scheme: 'category10' }}
          pointSize={8}
          pointColor={{ theme: 'background' }}
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          pointLabelYOffset={-12}
          useMesh={true}
          legends={[
            {
              anchor: 'bottom-right',
              direction: 'column',
              justify: false,
              translateX: 100,
              translateY: 0,
              itemsSpacing: 0,
              itemDirection: 'left-to-right',
              itemWidth: 80,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: 'circle',
              symbolBorderColor: 'rgba(0, 0, 0, .5)',
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemBackground: 'rgba(0, 0, 0, .03)',
                    itemOpacity: 1
                  }
                }
              ]
            }
          ]}
          animate={true}
        />
      )}
    </div>
  );
};

// Gráfico de Top 1 de falla por línea en MQS
const TopFailuresByLineChart = ({ data, filters }) => {
  const filteredData = useMemo(() => {
    if (!data) return [];
    
    return data.filter(item => {
      // Filtrar por fecha
      const itemDate = new Date(item.date || '2000-01-01');
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      const isDateInRange = itemDate >= startDate && itemDate <= endDate;
      
      // Filtrar por family
      const matchesFamily = filters.family === 'Todas' || item.Family === filters.family;
      
      return isDateInRange && matchesFamily;
    });
  }, [data, filters]);

  // Encontrar el top 1 de falla por línea
  const topFailuresByLine = useMemo(() => {
    if (!filteredData.length) return [];
    
    // Agrupar por línea y testcode
    const lineFailures = {};
    
    filteredData.forEach(item => {
      const line = item.Line || 'Unknown';
      const testcode = item.Testcode_Desc || 'Unknown';
      
      if (!lineFailures[line]) {
        lineFailures[line] = {};
      }
      
      if (!lineFailures[line][testcode]) {
        lineFailures[line][testcode] = 0;
      }
      
      lineFailures[line][testcode] += 1;
    });
    
    // Encontrar el top 1 de cada línea
    return Object.entries(lineFailures).map(([line, failures]) => {
      const sortedFailures = Object.entries(failures).sort((a, b) => b[1] - a[1]);
      const topFailure = sortedFailures[0] || ['No data', 0];
      
      return {
        line,
        testcode: topFailure[0].substring(0, 20) + (topFailure[0].length > 20 ? '...' : ''),
        fullTestcode: topFailure[0],
        count: topFailure[1]
      };
    }).sort((a, b) => b.count - a.count);
  }, [filteredData]);

  return (
    <div style={{ height: 400 }}>
      {topFailuresByLine.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No hay datos para los filtros seleccionados</p>
        </div>
      ) : (
        <ResponsiveBar
          data={topFailuresByLine}
          keys={['count']}
          indexBy="line"
          margin={{ top: 50, right: 130, bottom: 70, left: 80 }}
          padding={0.3}
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={{ scheme: 'nivo' }}
          borderWidth={1}
          borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 45,
            legend: 'Línea',
            legendPosition: 'middle',
            legendOffset: 55
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Cantidad de fallos',
            legendPosition: 'middle',
            legendOffset: -60
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelFormat={v => `${v}`}
          labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
          tooltip={({ data }) => (
            <div style={{ 
              padding: '10px', 
              background: 'white', 
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
            }}>
              <strong>Línea: {data.line}</strong><br />
              Falla: {data.fullTestcode || data.testcode}<br />
              Cantidad: {data.count}
            </div>
          )}
          animate={true}
        />
      )}
    </div>
  );
};

// Gráfico de top rechazos por mes
const TopRejectionsByMonth = ({ data, filters }) => {
  const filteredData = useMemo(() => {
    if (!data) return [];
    
    return data.filter(item => {
      // Filtrar por familia si está seleccionada
      const matchesFamily = filters.family === 'Todas' || 
                          (item.MODELO && item.MODELO.includes(filters.family));
      
      return matchesFamily;
    });
  }, [data, filters]);

  // Agrupar por mes y obtener el top rechazo
  const monthlyRejections = useMemo(() => {
    if (!filteredData.length) return [];
    
    // Agrupar por mes y código de falla
    const monthFailures = {};
    
    filteredData.forEach(item => {
      if (!item.FECHA_RECHAZO) return;
      
      const date = new Date(item.FECHA_RECHAZO);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const failCode = item.CODIGO_FALLA || 'Unknown';
      
      if (!monthFailures[monthKey]) {
        monthFailures[monthKey] = {};
      }
      
      if (!monthFailures[monthKey][failCode]) {
        monthFailures[monthKey][failCode] = 0;
      }
      
      monthFailures[monthKey][failCode] += 1;
    });
    
    // Encontrar el top rechazo de cada mes
    const months = Object.keys(monthFailures).sort();
    return months.map(month => {
      const failureCounts = monthFailures[month];
      const sortedFailures = Object.entries(failureCounts).sort((a, b) => b[1] - a[1]);
      const topFailure = sortedFailures[0] || ['No data', 0];
      
      // Formatear nombre del mes para mostrar
      const [year, monthNum] = month.split('-');
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const monthName = monthNames[parseInt(monthNum) - 1];
      
      return {
        month: `${monthName} ${year}`,
        code: topFailure[0],
        count: topFailure[1]
      };
    });
  }, [filteredData]);

  return (
    <div style={{ height: 400 }}>
      {monthlyRejections.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No hay datos para los filtros seleccionados</p>
        </div>
      ) : (
        <ResponsiveBar
          data={monthlyRejections}
          keys={['count']}
          indexBy="month"
          margin={{ top: 50, right: 130, bottom: 70, left: 80 }}
          padding={0.3}
          colors={{ scheme: 'set3' }}
          borderWidth={1}
          borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 45,
            legend: 'Mes',
            legendPosition: 'middle',
            legendOffset: 50
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Cantidad',
            legendPosition: 'middle',
            legendOffset: -60
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
          tooltip={({ data }) => (
            <div style={{ 
              padding: '10px', 
              background: 'white', 
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
            }}>
              <strong>Mes: {data.month}</strong><br />
              Código: {data.code}<br />
              Cantidad: {data.count}
            </div>
          )}
          animate={true}
        />
      )}
    </div>
  );
};

// Tablero de TrackIDs de ancho completo
const TrackIdDashboard = ({ mesDatos, mqsDatos }) => {
  const [selectedLine, setSelectedLine] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('');
  const [trackIds, setTrackIds] = useState([]);
  const [selectedTrackId, setSelectedTrackId] = useState('');
  const [repairData, setRepairData] = useState([]);
  
  // Obtener líneas y familias únicas
  const lines = useMemo(() => {
    if (!mqsDatos) return [];
    const uniqueLines = [...new Set(mqsDatos.map(item => item.Line).filter(Boolean))];
    return uniqueLines;
  }, [mqsDatos]);
  
  const families = useMemo(() => {
    if (!mqsDatos) return [];
    const uniqueFamilies = [...new Set(mqsDatos.map(item => item.Family).filter(Boolean))];
    return uniqueFamilies;
  }, [mqsDatos]);
  
  // Actualizar TrackIDs disponibles cuando cambie línea o familia
  useEffect(() => {
    if (!mqsDatos) return;
    
    const filteredTrackIds = mqsDatos.filter(item => 
      (selectedLine === '' || item.Line === selectedLine) &&
      (selectedFamily === '' || item.Family === selectedFamily)
    ).map(item => item.TrackId).filter(Boolean);
    
    // Eliminar duplicados
    const uniqueTrackIds = [...new Set(filteredTrackIds)];
    setTrackIds(uniqueTrackIds);
    setSelectedTrackId(''); // Reset selección
    setRepairData([]);
  }, [selectedLine, selectedFamily, mqsDatos]);
  
  // Buscar reparaciones cuando se selecciona un TrackId
  useEffect(() => {
    if (!selectedTrackId || !mesDatos) return;
    
    const repairs = mesDatos.filter(item => item.NS === selectedTrackId);
    setRepairData(repairs);
  }, [selectedTrackId, mesDatos]);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Historial de Reparaciones por TrackID</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Línea</label>
          <select
            value={selectedLine}
            onChange={(e) => setSelectedLine(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-sm"
          >
            <option value="">Todas las líneas</option>
            {lines.map(line => (
              <option key={line} value={line}>{line}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Familia</label>
          <select
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-sm"
          >
            <option value="">Todas las familias</option>
            {families.map(family => (
              <option key={family} value={family}>{family}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">TrackID</label>
          <select
            value={selectedTrackId}
            onChange={(e) => setSelectedTrackId(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-sm"
          >
            <option value="">Seleccione un TrackID</option>
            {trackIds.slice(0, 1000).map(id => ( // Limitar a 1000 para evitar problemas de rendimiento
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
          {trackIds.length > 1000 && (
            <p className="text-xs text-gray-500 mt-1">Mostrando 1000 de {trackIds.length} TrackIDs. Aplique más filtros para refinar la búsqueda.</p>
          )}
        </div>
      </div>
      
      {/* Datos de reparación */}
      {selectedTrackId && (
        <div className="overflow-x-auto">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Historial de reparaciones para TrackID: {selectedTrackId}</h3>
          
          {repairData.length === 0 ? (
            <p className="text-gray-500">No se encontraron registros de reparación para este TrackID.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Rechazo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Reparación</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código Falla</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posición</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Causa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reparador</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {repairData.map((repair, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(repair.FECHA_RECHAZO)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(repair.FECHA_REPARACION)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{repair.CODIGO_FALLA}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{repair.POSICION}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{repair.CAUSA}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{repair.ACCION}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{repair.REPARADOR}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

// Función auxiliar para formatear fechas
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (e) {
    return dateString;
  }
};

// Componente principal modificado
const ContenidoTablero = ({ activePage, user }) => {
  return (
    <div className="container mx-auto">
      {activePage === 'inicio' && (
        <div>
          <h1 className="text-2xl font-bold mb-6">Dashboard Principal</h1>
          {/* Contenido del dashboard */}
        </div>
      )}
      {/* Otros casos si quieres mantener algo de la lógica anterior */}
    </div>
  );
};

// Mantener los otros componentes existentes
const PaginaDocumentos = ({ currentUser }) => (
  <Tarjeta titulo="Documentos">
    <p>Página de documentos para usuario: {currentUser?.nombre || 'Invitado'}</p>
  </Tarjeta>
);

const PaginaLanzamientos = ({ currentUser }) => (
  <Tarjeta titulo="Lanzamientos">
    <p>Página de lanzamientos para usuario: {currentUser?.nombre || 'Invitado'}</p>
  </Tarjeta>
);

const PaginaFormacion = ({ currentUser }) => (
  <Tarjeta titulo="Formación">
    <p>Página de formación para usuario: {currentUser?.nombre || 'Invitado'}</p>
  </Tarjeta>
);

export default ContenidoTablero;