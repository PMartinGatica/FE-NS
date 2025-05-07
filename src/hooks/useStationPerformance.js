// hooks/useStationPerformance.js
import { useState, useCallback } from "react";
import API from "./api";

export const useStationPerformance = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPerformance = useCallback(async ({
    date_from,
    date_to,
    line = null,
    family = null
  }) => {
    if (!date_from || !date_to) return;
    
    setLoading(true);
    try {
      const params = { date_from, date_to };
      
      if (line) params.line = line;
      if (family) params.family = family;

      const response = await API.get("/stats/station-performance/", { params });
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err);
      console.error("Error fetching station performance:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    fetchPerformance
  };
};