import React, { useState, useEffect, useRef } from 'react';
import useYield from '../hooks/useYield';
import useMES from '../hooks/useMES';
import useMQS from '../hooks/useMQS';
import { fetchYield } from '../hooks/api'; // Para familias
import * as d3 from "d3";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default function Reportes() {
  // Estado para filtros
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

  // Obtener lista de familias disponibles (usando el sistema con fallback)
  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        // Intentará obtener del backend, si falla usará datos locales
        const data = await fetchYield();
        // Extraer familias únicas de los datos
        const uniqueFamilies = [...new Set(data.results.map(item => item.Family))];
        setFamilies(uniqueFamilies.filter(f => f)); // Filtrar valores vacíos
      } catch (err) {
        console.error("Error al obtener familias:", err);
      }
    };
    fetchFamilies();
  }, []);

  // Traer los datos de los hooks que guardan en localStorage
  const { datosMQS, cargando: cargandoMQS, error: errorMQS } = useMQS(dateFrom, dateTo);
  const { datosMES, cargando: cargandoMes, error: errorMes } = useMES(dateFrom, dateTo);
  const { datosYield, cargando: cargandoYield, error: errorYield } = useYield(dateFrom, dateTo);

  // Agrupa y calcula el FTY promedio por familia
  const ftyPorFamilia = React.useMemo(() => {
    const agrupado = {};
    datosYield.forEach(item => {
      if (!agrupado[item.Family]) agrupado[item.Family] = [];
      agrupado[item.Family].push(item.FTY);
    });
    return Object.entries(agrupado).map(([family, ftys]) => ({
      x: family,
      y: ftys.reduce((a, b) => a + b, 0) / ftys.length
    }));
  }, [datosYield]);

  // Filtra datos por fecha y familia seleccionada
  const datosFiltrados = React.useMemo(() => {
    console.log("Total registros sin filtrar:", datosYield?.length || 0);
    console.log("Fechas buscadas:", { dateFrom, dateTo });
    
    if (!datosYield || datosYield.length === 0) return [];
    
    let result = datosYield.filter(item => {
      if (!item || !item.date) return false;
      
      // Arreglar el filtrado por fecha - La función useYield puede no estar filtrando correctamente
      const itemDate = new Date(item.date);
      const from = new Date(dateFrom);
      const to = new Date(dateTo);
      
      // Ajustar para incluir todo el día "hasta"
      to.setHours(23, 59, 59, 999);
      
      return itemDate >= from && itemDate <= to;
    });
    
    // Filtrar por familia seleccionada
    if (selectedFamily) {
      result = result.filter(item => item.Family === selectedFamily);
    }
    
    console.log("Registros filtrados después de aplicar filtros de fecha:", result.length);
    if (result.length > 0) {
      console.log("Muestra de fechas filtradas:", result.slice(0, 5).map(i => i.date));
    }
    
    return result;
  }, [datosYield, dateFrom, dateTo, selectedFamily]);

  // Producción Total - Modificado para responder a cambios de fechas
  const produccionTotal = React.useMemo(() => {
    console.log("Calculando producción total con", datosFiltrados.length, "registros filtrados");
    
    if (!datosFiltrados.length) return 0;
    
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
      "Milos": "XCVR_LT",
      "MilosPlus": "L2VISION",
      "Orion": "XCVR_LT", 
      "Paros": "XCVR_LT",
      "Malmo": "UCT",
      "Wrangler": "XCVR_LT",
      "Cusco": "IFLASH",
      "Velar": "RADIOSLIM"
    };
    
    // Verificar los rangos de fecha para depuración
    const fechas = datosFiltrados.map(item => new Date(item.date));
    const minDate = new Date(Math.min(...fechas));
    const maxDate = new Date(Math.max(...fechas));
    console.log("Rango real de fechas en datos filtrados:", {
      min: minDate.toISOString().split('T')[0],
      max: maxDate.toISOString().split('T')[0]
    });
    
    // Agregar debug para ver qué modelos y procesos hay en los datos
    console.log("Modelos únicos en los datos filtrados:", 
      [...new Set(datosFiltrados.map(item => item.Name))]);
    
    const produccionPorModelo = datosFiltrados.reduce((acc, item) => {
      // Saltarse si no hay nombre
      if (!item.Name || !item.Name.trim()) return acc;
      
      const modelName = item.Name.trim();
      const estacionEsperada = modelStationsMap[modelName];
      
      // Si el modelo no está en el mapeo, registrarlo y contar todas sus unidades
      if (!estacionEsperada) {
        console.warn(`Modelo no mapeado: ${modelName}, usando su proceso actual: ${item.Process}`);
        // Se suma aunque no esté en el mapeo
        if (!acc[modelName]) acc[modelName] = 0;
        acc[modelName] += (item.Prime_Handle || 0);
        return acc;
      }
      
      // Verificar si coincide con la estación esperada
      if (item.Process === estacionEsperada) {
        if (!acc[modelName]) acc[modelName] = 0;
        acc[modelName] += (item.Prime_Handle || 0);
      }
      
      return acc;
    }, {});
    
    // Log detallado para encontrar el problema
    console.log("Producción por modelo:", produccionPorModelo);
    const total = Object.values(produccionPorModelo).reduce((sum, val) => sum + val, 0);
    console.log("Total calculado para el rango seleccionado:", total);
    
    return total;
  }, [datosFiltrados]);

  // Unidades falladas (DPHU)
  const unidadesFalladas = React.useMemo(() => {
    return datosFiltrados.reduce((sum, item) => sum + (item.Prime_Fail || 0), 0);
  }, [datosFiltrados]);

  // Promedio FTY
  const promedioFTY = React.useMemo(() => {
    const arr = datosFiltrados
      .map(item => item.FTY)
      .filter(v => typeof v === "number" && v >= 50);
    
    console.log(`FTY filtrados (≥50): ${arr.length} de ${datosFiltrados.length}`);
    
    return arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
  }, [datosFiltrados]);

  // Datos por familia
  const dataPorFamily = React.useMemo(() => {
    const agrupado = {};
    datosFiltrados.forEach(item => {
      if (!agrupado[item.Family]) agrupado[item.Family] = [];
      agrupado[item.Family].push(item);
    });
    return Object.entries(agrupado).map(([family, items]) => ({
      family,
      produccion: items.reduce((sum, i) => sum + (i.Prime_Handle || 0), 0),
      dphu: items.reduce((sum, i) => sum + (i.DPHU || 0), 0) / items.length || 0,
      fty: items.reduce((sum, i) => sum + (i.FTY || 0), 0) / items.length || 0,
    }));
  }, [datosFiltrados]);

  // D3 chart ref
  const chartRef = useRef();

  // Código para renderizar el gráfico D3
  useEffect(() => {
    // Arreglar el problema del gráfico - Asegurarse de que se renderiza siempre
    console.log("dataPorFamily para gráfico:", dataPorFamily);
    
    // Si no hay datos, dibuja un gráfico vacío pero con ejes
    if (!dataPorFamily.length) {
      d3.select(chartRef.current).selectAll("*").remove();
      
      const width = 800;
      const height = 400;
      const margin = { top: 40, right: 60, bottom: 60, left: 80 };

      const svg = d3.select(chartRef.current)
        .attr("width", width)
        .attr("height", height);
      
      // Dibuja ejes vacíos
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .text("No hay datos para mostrar en el período seleccionado")
        .attr("fill", "#888");
      
      return;
    }
    
    d3.select(chartRef.current).selectAll("*").remove();

    const width = 800;
    const height = 400;
    const margin = { top: 40, right: 60, bottom: 60, left: 80 };

    const svg = d3.select(chartRef.current)
      .attr("width", width)
      .attr("height", height);

    // Escalas
    const x = d3.scaleBand()
      .domain(dataPorFamily.map(d => d.family))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const yBar = d3.scaleLinear()
      .domain([0, d3.max(dataPorFamily, d => d.produccion) || 1])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const yLine = d3.scaleLinear()
      .domain([0, Math.max(10, d3.max(dataPorFamily, d => d.dphu) || 1)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Ejes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yBar));

    svg.append("g")
      .attr("transform", `translate(${width - margin.right},0)`)
      .call(d3.axisRight(yLine));

    // Barras (producción)
    svg.append("g")
      .selectAll("rect")
      .data(dataPorFamily)
      .join("rect")
      .attr("x", d => x(d.family))
      .attr("y", d => yBar(d.produccion))
      .attr("width", x.bandwidth())
      .attr("height", d => yBar(0) - yBar(d.produccion))
      .attr("fill", "#6366f1");

    // Línea DPHU
    const line = d3.line()
      .x(d => x(d.family) + x.bandwidth() / 2)
      .y(d => yLine(d.dphu));

    svg.append("path")
      .datum(dataPorFamily)
      .attr("fill", "none")
      .attr("stroke", "#f59e42")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Puntos de la línea
    svg.append("g")
      .selectAll("circle")
      .data(dataPorFamily)
      .join("circle")
      .attr("cx", d => x(d.family) + x.bandwidth() / 2)
      .attr("cy", d => yLine(d.dphu))
      .attr("r", 4)
      .attr("fill", "#f59e42");

    // Línea horizontal target DPHU = 7
    svg.append("line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", yLine(7))
      .attr("y2", yLine(7))
      .attr("stroke", "#e11d48")
      .attr("stroke-dasharray", "6 4")
      .attr("stroke-width", 2);

    // Etiqueta de target
    svg.append("text")
      .attr("x", width - margin.right + 5)
      .attr("y", yLine(7) + 4)
      .text("Target DPHU = 7")
      .attr("fill", "#e11d48")
      .attr("font-size", 12);

  }, [dataPorFamily]);

  // Mostrar carga o error si alguno está cargando o tiene error
  if (cargandoMQS || cargandoMes || cargandoYield) {
    return <div className="p-4">Cargando datos de reportes...</div>;
  }
  if (errorMQS || errorMes || errorYield) {
    return (
      <div className="p-4 text-red-600">
        {errorMQS && <div>Error MQS: {errorMQS.message}</div>}
        {errorMes && <div>Error MES: {errorMes.message}</div>}
        {errorYield && <div>Error YIELD: {errorYield.message}</div>}
      </div>
    );
  }

  // Función para buscar datos (no necesita hacer nada especial, los hooks lo manejan)
  const buscarDatos = () => {
    console.log("Buscando datos para:", dateFrom, "hasta", dateTo);
    // Los hooks se ejecutarán automáticamente con las nuevas fechas
  };

  // Estructura básica con filtros, sin gráficos ni tablas
  return (
    <div className="p-4 w-full">
      {/* Filtros */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard de Producción</h1>
        <div className="flex flex-wrap gap-3 items-center mt-2">
          {/* Selector tipo DataStudio */}
          <div className="flex border rounded-md overflow-hidden">
            {/* Input manual para la fecha desde */}
            <div className="px-3 py-2 bg-white border-r">
              <span className="text-xs text-gray-500 block">Desde</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border-none p-0 outline-none text-sm"
              />
            </div>
            
            {/* Input manual para la fecha hasta */}
            <div className="px-3 py-2 bg-white border-r">
              <span className="text-xs text-gray-500 block">Hasta</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border-none p-0 outline-none text-sm"
              />
            </div>
            
            {/* Selector rápido de rangos */}
            <div className="flex items-center px-3 bg-white">
              <select 
                className="border-none outline-none text-sm"
                onChange={(e) => {
                  const today = new Date();
                  let fromDate = new Date();
                  
                  switch(e.target.value) {
                    case 'today':
                      fromDate = new Date(today);
                      break;
                    case 'yesterday':
                      fromDate = new Date(today);
                      fromDate.setDate(fromDate.getDate() - 1);
                      break;
                    case '7days':
                      fromDate.setDate(today.getDate() - 6); // 7 días incluyendo hoy
                      break;
                    case '30days':
                      fromDate.setDate(today.getDate() - 29); // 30 días incluyendo hoy
                      break;
                    case 'month':
                      fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
                      break;
                    case 'lastmonth':
                      fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                      today.setDate(0); // último día del mes anterior
                      break;
                  }
                  
                  setDateFrom(fromDate.toISOString().split('T')[0]);
                  setDateTo(today.toISOString().split('T')[0]);
                }}
              >
                <option value="">Seleccionar rango</option>
                <option value="today">Hoy</option>
                <option value="yesterday">Ayer</option>
                <option value="7days">Últimos 7 días</option>
                <option value="30days">Últimos 30 días</option>
                <option value="month">Este mes</option>
                <option value="lastmonth">Mes anterior</option>
              </select>
            </div>
          </div>
          
          {/* Selector de familia existente */}
          <select
            className="border rounded-md px-3 py-2"
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
          >
            <option value="">Todas las familias</option>
            {families.map(family => (
              <option key={family} value={family}>{family}</option>
            ))}
          </select>
          <button 
            onClick={buscarDatos}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Buscar
          </button>
        </div>
      </div>
      {/* Cuadros de resultados */}
      <div className="flex gap-4 mb-8">
        <div className="bg-white shadow rounded p-4 flex-1 text-center">
          <div className="text-xs text-gray-500 mb-1">Producción Total</div>
          <div className="text-2xl font-bold">{produccionTotal}</div>
        </div>
        <div className="bg-white shadow rounded p-4 flex-1 text-center">
          {/* Vacío */}
        </div>
        <div className="bg-white shadow rounded p-4 flex-1 text-center">
          <div className="text-xs text-gray-500 mb-1">Promedio DPHU</div>
          <div className="text-2xl font-bold">{unidadesFalladas.toFixed(2)}%</div>
        </div>
        <div className="bg-white shadow rounded p-4 flex-1 text-center">
          <div className="text-xs text-gray-500 mb-1">Promedio FTY</div>
          <div className="text-2xl font-bold">{promedioFTY.toFixed(2)}%</div>
        </div>
      </div>
      {/* Gráfico combinado */}
      <div className="mt-8">
        <h2 className="font-bold mb-2">Producción y DPHU por Familia</h2>
        <svg ref={chartRef}></svg>
      </div>
    </div>
  );
}
