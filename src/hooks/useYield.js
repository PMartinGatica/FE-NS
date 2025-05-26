import { useState, useEffect } from "react";
import { fetchYield } from "./api";

const useYield = (dateFrom, dateTo) => {
  const [datosYield, setDatosYield] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCargando(true);
    setError(null);
    fetchYield({ date_from: dateFrom, date_to: dateTo })
      .then(data => setDatosYield(data.results || []))
      .catch(setError)
      .finally(() => setCargando(false));
  }, [dateFrom, dateTo]);

  return { datosYield, cargando, error };
};

export default useYield;