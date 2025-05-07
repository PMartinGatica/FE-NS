// hooks/useDashboard.js
import { useState, useEffect, useCallback } from "react";
import API from "./api";

export const useDashboard = (days = 7) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async (daysParam = days) => {
    setLoading(true);
    try {
      const response = await API.get("/dashboard/", { 
        params: { days: daysParam } 
      });
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err);
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const refreshData = (newDays = days) => {
    fetchDashboardData(newDays);
  };

  return {
    data,
    loading,
    error,
    refresh: refreshData
  };
};