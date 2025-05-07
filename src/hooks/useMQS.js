import { useState, useEffect, useCallback } from "react";
import API from "./api";

export const useMQS = (initialFilters = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    total: 0,
  });

  const fetchMQS = useCallback(async () => {
    setLoading(true);
    try {
      // Construir query params para filtros
      const params = { ...filters };
      if (pagination) {
        params.page = pagination.page;
        params.page_size = pagination.pageSize;
      }

      const response = await API.get("/mqs/", { params });
      setData(response.data.results || response.data);

      // Actualizar paginación si la API lo soporta
      if (response.data.count !== undefined) {
        setPagination((prev) => ({
          ...prev,
          total: response.data.count,
        }));
      }

      setError(null);
    } catch (err) {
      setError(err);
      console.error("Error fetching MQS data:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.pageSize]);

  useEffect(() => {
    fetchMQS();
  }, [fetchMQS]);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    // Volver a la primera página cuando cambian los filtros
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const changePage = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  return {
    data,
    loading,
    error,
    filters,
    pagination,
    updateFilters,
    changePage,
    refresh: fetchMQS,
  };
};

const useTopFailures = () => {
  const [topFailures, setTopFailures] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarMQS = async () => {
      try {
        setCargando(true);
        const res = await fetch("http://127.0.0.1:8000/mqs/");
        if (!res.ok) throw new Error(`Error en la solicitud: ${res.status}`);
        const data = await res.json();

        // Agrupar por Testcode + Family
        const map = {};
        data.forEach((item) => {
          const key = `${item.Testcode}||${item.Family}`;
          if (!map[key]) {
            map[key] = {
              testcode: item.Testcode,
              family: item.Family,
              primeCount: 0,
              ntfCount: 0,
            };
          }
          if (item.Prime) map[key].primeCount += 1;
          if (item.NTF) map[key].ntfCount += 1;
        });

        // Obtener el top 1 de cada Family (el Testcode con más Prime)
        const familyMap = {};
        Object.values(map).forEach((row) => {
          const fam = row.family;
          if (!familyMap[fam] || row.primeCount > familyMap[fam].primeCount) {
            familyMap[fam] = row;
          }
        });

        // Ordenar de mayor a menor por primeCount
        const topByFamily = Object.values(familyMap).sort(
          (a, b) => b.primeCount - a.primeCount
        );

        setTopFailures(topByFamily);
      } catch (err) {
        console.error("Error al cargar MQS:", err);
        setError(err);
      } finally {
        setCargando(false);
      }
    };

    cargarMQS();
  }, []);

  return { topFailures, cargando, error };
};

export default useTopFailures;