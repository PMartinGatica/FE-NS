// hooks/api.js
import axios from "axios";
import { mesData } from "../data/mesData";
import { mqsData } from "../data/mqsData";

// Configura la URL base para todas las solicitudes
const API = axios.create({
  baseURL: "http://localhost:8000",
});

// Añade interceptores para manejar tokens, errores, etc.
API.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejo centralizado de errores
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

// Utilidad para fallback a datos locales
async function fetchWithFallback(apiCall, localData) {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    console.warn("Usando datos locales por error de backend:", error.message);
    return localData;
  }
}

// Modifica esta función para forzar el uso del backend
export const fetchYield = async (dateFrom = '', dateTo = '', page = 1) => {
  try {
    // Añadir log para ver qué entorno estamos usando
    console.log("Ambiente:", process.env.NODE_ENV);
    console.log("Hostname:", window.location.hostname);
    
    // FORZAR USO DEL BACKEND - Comenta esta condición para usar siempre el backend
    const useLocalData = false; // Cambia a false para usar el backend
    
    if (useLocalData) {
      console.log("[MODO DESARROLLO] Usando datos locales (yieldData.js)");
      const { yieldData } = await import('../data/yieldData.js');
      return { 
        count: yieldData.results.length, 
        results: yieldData.results 
      };
    }
    
    // Construir URL con parámetros
    let url = '/api/yield/?';
    if (dateFrom) url += `date_from=${dateFrom}&`;
    if (dateTo) url += `date_to=${dateTo}&`;
    url += `page=${page}`;
    
    console.log(`[BACKEND] Solicitando: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Error HTTP: ${response.status} - ${response.statusText}`);
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`[BACKEND] Recibidos ${data.results?.length || 0} de ${data.count || 0} registros totales`);
    
    return data;
  } catch (error) {
    console.error("Error al obtener datos del backend:", error);
    
    // Como plan B, usar datos locales si falla el backend
    console.warn("[FALLBACK] Usando datos locales debido a error");
    const { yieldData } = await import('../data/yieldData.js');
    return { 
      count: yieldData.results.length, 
      results: yieldData.results 
    };
  }
};

export async function fetchMES(params) {
  return fetchWithFallback(
    () => API.get("/api/mes/", { params }),
    mesData
  );
}

export async function fetchMQS(params) {
  return fetchWithFallback(
    () => API.get("/api/mqs/", { params }),
    mqsData
  );
}

export default API;