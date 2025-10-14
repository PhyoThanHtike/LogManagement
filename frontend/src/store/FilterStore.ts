// src/store/filterStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export interface FilterState {
  keyword: string;
  tenant: string;
  action: string;
  source: string;
  severity: string;
  date: string;
  startDate: string;
  endDate: string;
  ts: string;
}

interface FilterActions {
  setFilters: (filters: Partial<FilterState>) => void;
  setKeyword: (keyword: string) => void;
  setTenant: (tenant: string) => void;
  setAction: (action: string) => void;
  setSource: (source: string) => void;
  setSeverity: (severity: string) => void;
  setDate: (date: string) => void;
  setDateRange: (startDate: string, endDate: string) => void;
  setTs: (ts: string) => void;
  reset: () => void;
  initializeTenant: (userRole?: string, userTenant?: string) => void;
}

export type FilterStore = FilterState & FilterActions;

const initialFilterState: FilterState = {
  keyword: "",
  tenant: "ALL_TENANTS", // Will be initialized based on user role
  action: "ALL",
  source: "ALL",
  severity: "",
  date: "ALL",
  startDate: "",
  endDate: "",
  ts: "",
};

export const useFilterStore = create<FilterStore>()(
  immer(
    persist(
      (set, get) => ({
        ...initialFilterState,

        setFilters: (filters: Partial<FilterState>) => {
          set((state) => {
            Object.assign(state, filters);
          });
        },

        setKeyword: (keyword: string) => {
          set((state) => {
            state.keyword = keyword;
          });
        },

        setTenant: (tenant: string) => {
          set((state) => {
            state.tenant = tenant;
          });
        },

        setAction: (action: string) => {
          set((state) => {
            state.action = action;
          });
        },

        setSource: (source: string) => {
          set((state) => {
            state.source = source;
          });
        },

        setSeverity: (severity: string) => {
          set((state) => {
            state.severity = severity;
          });
        },

        setDate: (date: string) => {
          set((state) => {
            state.date = date;
          });
        },

        setDateRange: (startDate: string, endDate: string) => {
          set((state) => {
            state.startDate = startDate;
            state.endDate = endDate;
          });
        },

        setTs: (ts: string) => {
          set((state) => {
            state.ts = ts;
          });
        },

        reset: () => {
          set((state) => {
            Object.assign(state, initialFilterState);
          });
        },
        initializeTenant: (userRole?: string, userTenant?: string) => {
          set((state) => {
            // Only initialize if tenant hasn't been explicitly set (is still at initial value)
            if (state.tenant === "ALL_TENANTS" || !state.tenant) {
              if (userRole === "ADMIN") {
                state.tenant = "ALL_TENANTS"; // All tenants for ADMIN
              } else if (userTenant) {
                state.tenant = userTenant; // User's specific tenant
              }
              // If no user role/tenant, leave as ALL_TENANTS (default)
            }
          });
        },
      }),
      {
        name: "filter-storage",
        storage: createJSONStorage(() => sessionStorage),
        partialize: (state) => ({
          keyword: state.keyword,
          tenant: state.tenant,
          action: state.action,
          source: state.source,
          severity: state.severity,
          date: state.date,
          startDate: state.startDate,
          endDate: state.endDate,
          ts: state.ts,
        }),
      }
    )
  )
);

// Selectors
export const useKeyword = () => useFilterStore((state) => state.keyword);
export const useTenant = () => useFilterStore((state) => state.tenant);
export const useAction = () => useFilterStore((state) => state.action);
export const useSource = () => useFilterStore((state) => state.source);
export const useSeverity = () => useFilterStore((state) => state.severity);
export const useDate = () => useFilterStore((state) => state.date);
export const useDateRange = () =>
  useFilterStore((state) => ({
    startDate: state.startDate,
    endDate: state.endDate,
  }));
export const useTs = () => useFilterStore((state) => state.ts);
export const useAllFilters = () => useFilterStore((state) => state);
