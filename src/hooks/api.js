// hooks/api.js
import axios from "axios";

// Configura la URL base para todas las solicitudes
const API = axios.create({
  baseURL: "http://localhost:8000",
});

// Añade interceptores para manejar tokens, errores, etc.
API.interceptors.request.use(
  (config) => {
    // Puedes agregar headers como token de autorización aquí si es necesario
    return config;
  },
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

export default API;