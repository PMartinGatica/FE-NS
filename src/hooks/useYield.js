import { useState, useEffect } from "react";

const useYield = () => {
  const [datosYield, setDatosYield] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDatosYield = async () => {
      try {
        setCargando(true);
        const res = await fetch("http://127.0.0.1:8000/yield/");
        if (!res.ok)
          throw new Error(`Error en la solicitud de yield: ${res.status}`);

        const data = await res.json();
        setDatosYield(data);
      } catch (err) {
        console.error("Error al cargar datos de yield:", err);
        setError(err);
      } finally {
        setCargando(false);
      }
    };

    cargarDatosYield();
  }, []);

  return { datosYield, cargando, error };
};

export default useYield;