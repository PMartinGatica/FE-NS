// hooks/useTopFailures.js
import { useState, useCallback } from "react";
import API from "./api";

export const useTopFailures = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTopFailures = useCallback(async ({
    family = null,
    date_from = null,
    date_to = null,
    limit = 10
  } = {}) => {
    setLoading(true);
    try {
      const params = { limit };
      
      if (family) params.family = family;
      if (date_from) params.date_from = date_from;
      if (date_to) params.date_to = date_to;

      const response = await API.get("/stats/top-failures/", { params });
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err);
      console.error("Error fetching top failures:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    fetchTopFailures
  };
};