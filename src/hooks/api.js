// hooks/api.js
import axios from "axios";
import { yieldData } from "../data/yieldData";
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

export async function fetchYield(params) {
  return fetchWithFallback(
    () => API.get("/api/yield/", { params }),
    yieldData
  );
}

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