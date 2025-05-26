import React, { useState, useEffect, useRef } from 'react';
import useYield from '../hooks/useYield';
import useMES from '../hooks/useMES';
import useMQS from '../hooks/useMQS';
import { fetchYield } from '../hooks/api'; // Para familias
import * as d3 from "d3";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default function Reportes() {
  // 1. Primero todos los estados
  const [dateFrom, setDateFrom] = useState(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    return thirtyDaysAgo.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedFamily, setSelectedFamily] = useState('');
  const [families, setFamilies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState('Desconocida');

  // Usar el hook actualizado con soporte para paginación
  const { datosYield, cargando, error, progress } = useYield(dateFrom, dateTo);

  // Mostrar indicador de carga global
  useEffect(() => {
    setIsLoading(cargando);
  }, [cargando]);

  // Obtener lista de familias disponibles
  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        // Usar los datos ya cargados para extraer familias únicas
        if (datosYield && datosYield.length > 0) {
          const uniqueFamilies = [...new Set(datosYield.map(item => item.Family))]
            .filter(f => f) // Filtrar valores nulos o vacíos
            .sort(); // Ordenar alfabéticamente
          
          setFamilies(uniqueFamilies);
          console.log(`Encontradas ${uniqueFamilies.length} familias únicas`);
        }
      } catch (err) {
        console.error("Error al obtener familias:", err);
      }
    };
    
    fetchFamilies();
  }, [datosYield]);

  // Filtrar datos según familia seleccionada
  const datosFiltrados = React.useMemo(() => {
    if (!datosYield || !datosYield.length) return [];
    
    console.log(`Filtrando ${datosYield.length} registros con fecha ${dateFrom} a ${dateTo}`);
    
    // Los datos ya vienen filtrados por fecha desde useYield
    let result = [...datosYield];
    
    // Verificar si hay fechas fuera del rango esperado (depuración)
    const fechasInesperadas = result.filter(item => {
      try {
        const año = new Date(item.date).getFullYear();
        const fromYear = new Date(dateFrom).getFullYear();
        const toYear = new Date(dateTo).getFullYear();
        
        return año < fromYear || año > toYear;
      } catch (e) {
        return false;
      }
    });
    
    if (fechasInesperadas.length > 0) {
      console.warn(`Se encontraron ${fechasInesperadas.length} fechas fuera del rango esperado`);
    }
    
    // Filtrar por familia seleccionada
    if (selectedFamily && selectedFamily !== "Todas las familias") {
      result = result.filter(item => item.Family === selectedFamily);
      console.log(`Después de filtrar por familia ${selectedFamily}: ${result.length} registros`);
    }
    
    return result;
  }, [datosYield, dateFrom, dateTo, selectedFamily]);

  // Producción Total con el mapeo de estaciones
  const produccionTotal = React.useMemo(() => {
    if (!datosFiltrados.length) return 0;
    
    console.log(`Calculando producción total con ${datosFiltrados.length} registros filtrados`);
    
    // Mapeo hardcodeado de modelo a estación de entrada
    const modelStationsMap = {
      "Aruba4000": "RADIOSLIM",
      "Aura": "UCT",
      "Bangkok 5G": "FODTEST",
      "Bora": "L2AR",
      "Lamu": "L2VISION",
      "Lamu Lite GO": "L2VISION",
      "Lamu Lite": "L2VISION",
      "Manila": "L2VISION",
      "Milos": "UCT",
      "MilosPlus": "L2AR",
      "Orion": "L2AR", 
      "Paros": "L2AR",
      "Malmo": "UCT",
      "Wrangler": "XCVR_LT",
      "Cusco": "IFLASH",
      "Velar": "RADIOSLIM"
    };
    
    // Estadísticas adicionales para depuración
    const modelosEnDatos = [...new Set(datosFiltrados.map(item => item.Name))].filter(Boolean);
    console.log(`Modelos encontrados en los datos (${modelosEnDatos.length}):`, modelosEnDatos);
    
    const modelosNoMapeados = modelosEnDatos.filter(model => !modelStationsMap[model]);
    if (modelosNoMapeados.length) {
      console.warn(`Modelos sin mapeo (${modelosNoMapeados.length}):`, modelosNoMapeados);
    }
    
    const produccionPorModelo = datosFiltrados.reduce((acc, item) => {
      // Saltarse si no hay nombre
      if (!item.Name || !item.Name.trim()) return acc;
      
      const modelName = item.Name.trim();
      const estacionEsperada = modelStationsMap[modelName];
      
      // Si no hay estación esperada definida, usar cualquier proceso
      if (!estacionEsperada) {
        if (!acc[`${modelName}-${item.Process || 'unknown'}`]) {
          acc[`${modelName}-${item.Process || 'unknown'}`] = 0;
        }
        acc[`${modelName}-${item.Process || 'unknown'}`] += (item.Prime_Handle || 0);
        return acc;
      }
      
      // Verificar si coincide con la estación esperada
      if (item.Process === estacionEsperada) {
        const key = `${modelName}-${estacionEsperada}`;
        if (!acc[key]) acc[key] = 0;
        acc[key] += (item.Prime_Handle || 0);
      }
      
      return acc;
    }, {});
    
    console.log("Producción por modelo-estación:", produccionPorModelo);
    const total = Object.values(produccionPorModelo).reduce((sum, val) => sum + val, 0);
    console.log(`Total calculado: ${total}`);
    
    return total;
  }, [datosFiltrados]);

  // Calcular promedio de DPHU y FTY
  const { promedioDPHU, promedioFTY } = React.useMemo(() => {
    if (!datosFiltrados.length) return { promedioDPHU: 0, promedioFTY: 0 };
    
    // Calcular DPHU y FTY promedio de los registros filtrados
    const dphuValues = datosFiltrados
      .map(item => item.DPHU)
      .filter(v => typeof v === "number" && !isNaN(v));
    
    const ftyValues = datosFiltrados
      .map(item => item.FTY)
      .filter(v => typeof v === "number" && !isNaN(v));
    
    return {
      promedioDPHU: dphuValues.length ? dphuValues.reduce((a, b) => a + b, 0) / dphuValues.length : 0,
      promedioFTY: ftyValues.length ? ftyValues.reduce((a, b) => a + b, 0) / ftyValues.length : 0
    };
  }, [datosFiltrados]);

  // Función para aplicar filtros
  const aplicarFiltros = () => {
    // Los filtros ya se aplican automáticamente a través de los hooks
    console.log("Aplicando filtros con fecha:", dateFrom, "hasta", dateTo);
  };

  // Efecto para determinar la fuente de los datos
  useEffect(() => {
    if (datosYield && datosYield.length > 0) {
      // Determinar la fuente basándonos en el número de registros y otros indicadores
      if (datosYield.length === 100 && produccionTotal === 42003) {
        setDataSource('Datos locales (yieldData.js)');
      } else {
        setDataSource(`Backend (${datosYield.length} registros)`);
      }
      console.log("Registros cargados:", datosYield.length);
    } else {
      setDataSource('Sin datos');
    }
  }, [datosYield, produccionTotal]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard de Producción</h1>
      
      {/* Filtros */}
      <div className="flex gap-4 mb-6 items-end">
        <div>
          <div className="text-sm mb-1">Desde</div>
          <input 
            type="date" 
            value={dateFrom} 
            onChange={(e) => setDateFrom(e.target.value)}
            className="border rounded p-2"
          />
        </div>
        <div>
          <div className="text-sm mb-1">Hasta</div>
          <input 
            type="date" 
            value={dateTo} 
            onChange={(e) => setDateTo(e.target.value)}
            className="border rounded p-2"
          />
        </div>
        <div>
          <div className="text-sm mb-1">Seleccionar rango</div>
          <select className="border rounded p-2 h-[42px]">
            <option>Últimos 7 días</option>
            <option>Últimos 30 días</option>
            <option>Este mes</option>
            <option>Mes pasado</option>
          </select>
        </div>
        <div>
          <div className="text-sm mb-1">Familia</div>
          <select 
            value={selectedFamily} 
            onChange={(e) => setSelectedFamily(e.target.value)}
            className="border rounded p-2 h-[42px]"
          >
            <option value="">Todas las familias</option>
            {families.map(family => (
              <option key={family} value={family}>{family}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={aplicarFiltros}
          className="bg-blue-500 text-white px-6 py-2 rounded"
          disabled={isLoading}
        >
          {isLoading ? "Cargando..." : "Buscar"}
        </button>
      </div>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex flex-col justify-center items-center mb-4">
          <div className="w-full max-w-md bg-gray-200 rounded-full h-2.5 mb-2">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-600">
            Cargando datos ({progress}%)... {progress === 100 ? "Procesando..." : ""}
          </span>
        </div>
      )}
      
      {/* Error display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error.message || "Hubo un problema al cargar los datos"}
        </div>
      )}
      
      {/* Tarjetas de KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow rounded p-4 flex-1 text-center">
          <div className="text-xs text-gray-500 mb-1">Producción Total</div>
          <div className="text-2xl font-bold">
            {isLoading ? "Calculando..." : produccionTotal.toLocaleString()}
          </div>
        </div>
        <div className="bg-white shadow rounded p-4 flex-1 text-center">
          <div className="text-xs text-gray-500 mb-1">Promedio DPHU</div>
          <div className="text-2xl font-bold">
            {isLoading ? "Calculando..." : `${promedioDPHU.toFixed(2)}%`}
          </div>
        </div>
        <div className="bg-white shadow rounded p-4 flex-1 text-center">
          <div className="text-xs text-gray-500 mb-1">Promedio FTY</div>
          <div className="text-2xl font-bold">
            {isLoading ? "Calculando..." : `${promedioFTY.toFixed(2)}%`}
          </div>
        </div>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Producción y DPHU por Familia</h2>
      
      {/* Aquí iría tu gráfico u otra visualización */}
      <div className="bg-white shadow rounded p-4 h-[400px] flex justify-center items-center">
        {isLoading ? (
          <div>Cargando gráficos...</div>
        ) : datosFiltrados.length === 0 ? (
          <div>No hay datos disponibles para mostrar</div>
        ) : (
          <div>Aquí va tu gráfico con los {datosFiltrados.length} registros</div>
        )}
      </div>
      
      {/* Indicador de fuente de datos */}
      <div className="flex justify-between items-center mb-2">
        <div></div> {/* Espacio vacío para mantener el justificado */}
        <div className="text-xs bg-gray-100 rounded px-2 py-1">
          Fuente: <span className={dataSource.includes('local') ? 'text-orange-600' : 'text-green-600'}>
            {dataSource}
          </span>
        </div>
      </div>
    </div>
  );
}
