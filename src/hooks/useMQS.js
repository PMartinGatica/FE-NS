import { useState, useEffect } from "react";
import { fetchMQS } from "./api";

const useMQS = (dateFrom, dateTo) => {
  const [datosMQS, setDatosMQS] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCargando(true);
    setError(null);
    fetchMQS({ date_from: dateFrom, date_to: dateTo })
      .then(data => setDatosMQS(data.results || []))
      .catch(setError)
      .finally(() => setCargando(false));
  }, [dateFrom, dateTo]);

  return { datosMQS, cargando, error };
};

export default useMQS;