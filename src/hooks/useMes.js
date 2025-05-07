import { useState, useEffect } from "react";

const useMes = () => {
  const [datosMes, setDatosMes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDatosMes = async () => {
      try {
        setCargando(true);
        const res = await fetch("http://127.0.0.1:8000/mes/");
        if (!res.ok) throw new Error(`Error en la solicitud de mes: ${res.status}`);

        const data = await res.json();
        setDatosMes(data);
      } catch (err) {
        console.error("Error al cargar datos de mes:", err);
        setError(err);
      } finally {
        setCargando(false);
      }
    };

    cargarDatosMes();
  }, []);

  return { datosMes, cargando, error };
};

export default useMes;