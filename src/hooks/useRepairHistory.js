// hooks/useRepairHistory.js
import { useState, useCallback } from "react";
import API from "./api";

export const useRepairHistory = () => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async (trackId) => {
    if (!trackId) return;
    
    setLoading(true);
    try {
      const response = await API.get(`/stats/repair-history/${trackId}/`);
      setHistory(response.data);
      setError(null);
    } catch (err) {
      setError(err);
      console.error(`Error fetching repair history for ${trackId}:`, err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    history,
    loading,
    error,
    fetchHistory
  };
};