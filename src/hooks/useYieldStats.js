// hooks/useYieldStats.js
import { useState, useCallback } from "react";
import API from "./api";

export const useYieldStats = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async (date_from, date_to, family = null, line = null) => {
    setLoading(true);
    try {
      const params = {
        date_from,
        date_to
      };
      
      if (family) params.family = family;
      if (line) params.line = line;

      const response = await API.get("/stats/yield/", { params });
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err);
      console.error("Error fetching yield stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    fetchStats
  };
};