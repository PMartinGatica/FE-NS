import { useState, useEffect } from "react";
import { fetchMES } from "./api";

const useMES = (dateFrom, dateTo) => {
  const [datosMES, setDatosMES] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCargando(true);
    setError(null);
    fetchMES({ date_from: dateFrom, date_to: dateTo })
      .then((data) => setDatosMES(data.results || []))
      .catch(setError)
      .finally(() => setCargando(false));
  }, [dateFrom, dateTo]);

  return { datosMES, cargando, error };
};

export default useMES;