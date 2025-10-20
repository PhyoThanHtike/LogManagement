// src/hooks/useFilterSearchParams.ts
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useFilterStore } from "@/store/FilterStore";
import { useUserStore } from "@/store/UserStore";

const VALID_TENANTS = ["TENANT1", "TENANT2", "TENANT3", "TENANT4"];
const VALID_SOURCES = ["FIREWALL", "API", "CROWDSTRIKE", "AWS", "M365", "AD", "NETWORK"];
const VALID_ACTIONS = ["ALLOW", "DENY", "CREATE", "DELETE", "UPDATE", "ALERT", "LOGIN", "QUARANTINE", "BLOCK"];
const VALID_SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const isValidTenant = (value: string) => !value || value === "ALL_TENANTS" || VALID_TENANTS.includes(value);
const isValidSource = (value: string) => !value || value === "ALL" || VALID_SOURCES.includes(value);
const isValidAction = (value: string) => !value || value === "ALL" || VALID_ACTIONS.includes(value);
const isValidSeverity = (value: string) => !value || value === "ALL" || VALID_SEVERITIES.includes(value);

export const useFilterSearchParams = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const filters = useFilterStore();
  const { user } = useUserStore();
  const previousSearchRef = useRef<string>("");
  const isInitializedRef = useRef(false);

  // Initialize filters from URL and user on mount
  useEffect(() => {
    if (!user || isInitializedRef.current) return;
    isInitializedRef.current = true;

    const searchParams = new URLSearchParams(location.search);

    let tenant = searchParams.get("tenant") || "ALL_TENANTS";
    const source = searchParams.get("source") || "ALL";
    const action = searchParams.get("action") || "ALL";
    const severity = searchParams.get("severity") || "ALL";

    // For USER role, always lock tenant to their own tenant (ignore URL param)
    if (user.role === "USER" && user.tenant) {
      tenant = user.tenant;
    }

    // Validate all values
    if (!isValidTenant(tenant)) {
      tenant = "ALL_TENANTS";
    }
    const validSource = isValidSource(source) ? source : "ALL";
    const validAction = isValidAction(action) ? action : "ALL";
    const validSeverity = isValidSeverity(severity) ? severity : "ALL";

    const urlFilters = {
      ts: searchParams.get("ts") || "desc",
      tenant,
      keyword: searchParams.get("keyword") || "",
      action: validAction,
      source: validSource,
      severity: validSeverity,
      date: searchParams.get("date") || "ALL",
      startDate: searchParams.get("startDate") || "",
      endDate: searchParams.get("endDate") || "",
    };

    filters.setFilters(urlFilters);
  }, [user, filters]);

  // Update URL when filters change
  useEffect(() => {
    if (!isInitializedRef.current) return;

    const searchParams = new URLSearchParams();

    if (filters.ts) searchParams.set("ts", filters.ts);
    
    // For USER role, never include tenant in URL (it's always their tenant)
    if (user?.role === "ADMIN" && filters.tenant && filters.tenant !== "ALL_TENANTS") {
      searchParams.set("tenant", filters.tenant);
    }
    
    if (filters.keyword) searchParams.set("keyword", filters.keyword);
    if (filters.action && filters.action !== "ALL") searchParams.set("action", filters.action);
    if (filters.source && filters.source !== "ALL") searchParams.set("source", filters.source);
    if (filters.severity && filters.severity !== "ALL") searchParams.set("severity", filters.severity);
    if (filters.date && filters.date !== "ALL") searchParams.set("date", filters.date);
    if (filters.startDate) searchParams.set("startDate", filters.startDate);
    if (filters.endDate) searchParams.set("endDate", filters.endDate);

    const newSearch = searchParams.toString();

    if (newSearch !== previousSearchRef.current) {
      previousSearchRef.current = newSearch;
      navigate(`${location.pathname}?${newSearch}`, { replace: true });
    }
  }, [filters, navigate, location.pathname, user?.role]);
};