import { useState, useEffect } from 'react';
import { fetchYield } from './api';

export default function useYield(dateFrom, dateTo) {
  const [datosYield, setDatosYield] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0); // Para seguimiento de carga
  
  useEffect(() => {
    setCargando(true);
    setError(null);
    setProgress(0);
    
    // Función para cargar todos los datos usando paginación
    const cargarTodosLosDatos = async () => {
      try {
        console.log("Solicitando primera página al backend para fechas:", dateFrom, "a", dateTo);
        
        // Primera llamada para obtener el total de registros
        const primeraPagina = await fetchYield(dateFrom, dateTo, 1);
        
        if (!primeraPagina || !primeraPagina.results) {
          console.error("No se recibieron resultados en la primera página");
          setDatosYield([]);
          return;
        }
        
        // Si hay pocos registros, podemos devolver solo esta página
        if (primeraPagina.count <= primeraPagina.results.length) {
          console.log(`Cargados ${primeraPagina.results.length} registros (sin paginación)`);
          setDatosYield(primeraPagina.results);
          return;
        }
        
        // Calcular número total de páginas
        const tamañoPagina = primeraPagina.results.length;
        const totalPaginas = Math.ceil(primeraPagina.count / tamañoPagina);
        console.log(`Total de registros: ${primeraPagina.count}, páginas: ${totalPaginas}, registros por página: ${tamañoPagina}`);
        
        // Guardar primera página de resultados
        let todosLosDatos = [...primeraPagina.results];
        
        // Actualizar el progreso
        setProgress(Math.round((todosLosDatos.length / primeraPagina.count) * 100));
        
        // Cargar el resto de páginas secuencialmente para garantizar que todas se procesen
        for (let pagina = 2; pagina <= totalPaginas; pagina++) {
          try {
            console.log(`Solicitando página ${pagina} de ${totalPaginas}...`);
            const paginaData = await fetchYield(dateFrom, dateTo, pagina);
            
            if (paginaData && paginaData.results && paginaData.results.length > 0) {
              todosLosDatos = [...todosLosDatos, ...paginaData.results];
              console.log(`Página ${pagina}: añadidos ${paginaData.results.length} registros, total actual: ${todosLosDatos.length}`);
              
              // Actualizar el progreso después de cada página
              setProgress(Math.round((todosLosDatos.length / primeraPagina.count) * 100));
              
              // Actualizar los datos después de cada página para mostrar progreso
              if (pagina % 5 === 0 || pagina === totalPaginas) {
                setDatosYield([...todosLosDatos]);
              }
            } else {
              console.warn(`Página ${pagina} vacía o con formato incorrecto`);
            }
          } catch (pageError) {
            console.error(`Error al cargar página ${pagina}:`, pageError);
            // Continuar con la siguiente página si una falla
          }
        }
        
        console.log(`Carga completa: ${todosLosDatos.length}/${primeraPagina.count} registros (${Math.round((todosLosDatos.length / primeraPagina.count) * 100)}%)`);
        setDatosYield(todosLosDatos);
      } catch (err) {
        console.error("Error al cargar datos completos:", err);
        setError(err);
        // Intentar cargar datos locales como fallback
        try {
          console.warn("Intentando usar datos locales como fallback...");
          const { yieldData } = await import('../data/yieldData.js');
          setDatosYield(yieldData.results || []);
          console.log("Datos locales cargados como fallback:", yieldData.results?.length || 0, "registros");
        } catch (fallbackError) {
          console.error("Error también con datos locales:", fallbackError);
        }
      } finally {
        setCargando(false);
      }
    };
    
    cargarTodosLosDatos();
  }, [dateFrom, dateTo]);
  
  return { datosYield, cargando, error, progress };
}