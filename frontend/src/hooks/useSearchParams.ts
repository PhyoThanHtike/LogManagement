// src/hooks/useFilterSearchParams.ts
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useFilterStore } from "@/store/FilterStore";

export const useFilterSearchParams = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const filters = useFilterStore();

  // Update URL when filters change
  useEffect(() => {
    const searchParams = new URLSearchParams();
    
    if (filters.tenant && filters.tenant !== 'ALL_TENANTS') searchParams.set("tenant", filters.tenant);
    if (filters.keyword) searchParams.set("keyword", filters.keyword);
    if (filters.action && filters.action !== 'ALL') searchParams.set("action", filters.action);
    if (filters.source && filters.source !== 'ALL') searchParams.set("source", filters.source);
    if (filters.severity) searchParams.set("severity", filters.severity);
    if (filters.date && filters.date !== 'ALL') searchParams.set("date", filters.date);
    if (filters.startDate) searchParams.set("startDate", filters.startDate);
    if (filters.endDate) searchParams.set("endDate", filters.endDate);
    if (filters.ts) searchParams.set("ts", filters.ts);

    const newSearch = searchParams.toString();
    const currentSearch = location.search.slice(1);
    
    if (newSearch !== currentSearch) {
      navigate(`${location.pathname}?${newSearch}`, { replace: true });
    }
  }, [filters, navigate, location]);

  // Initialize filters from URL on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    
    const urlFilters = {
      tenant: searchParams.get("tenant") || "ALL_TENANTS",
      keyword: searchParams.get("keyword") || "",
      action: searchParams.get("action") || "ALL",
      source: searchParams.get("source") || "ALL",
      severity: searchParams.get("severity") || "",
      date: searchParams.get("date") || "ALL",
      startDate: searchParams.get("startDate") || "",
      endDate: searchParams.get("endDate") || "",
      ts: searchParams.get("ts") || "desc",
    };

    filters.setFilters(urlFilters);
  }, [location.search]);
};