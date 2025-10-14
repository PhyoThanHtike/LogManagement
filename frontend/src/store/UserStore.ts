import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface User {
  userId: string;
  email: string;
  userName: string;
  role: 'ADMIN' | string;
  tenant: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
}

interface UserActions {
  setUser: (user: User | null) => void;
  clearUser: () => void;
}

export type UserStore = UserState & UserActions;

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
};

export const useUserStore = create<UserStore>()(
  immer(
    persist(
      (set) => ({
        ...initialState,
        
        setUser: (user: User | null) => {
          set((state) => {
            state.user = user;
            state.isAuthenticated = !!user;
          });
        },

        clearUser: () => {
          set((state) => {
            state.user = null;
            state.isAuthenticated = false;
          });
        },
      }),
      {
        name: 'user-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);

// Selectors
export const useUser = () => useUserStore((state) => state.user);
export const useIsAuthenticated = () => useUserStore((state) => state.isAuthenticated);
export const useUserRole = () => useUserStore((state) => state.user?.role);
export const useUserTenant = () => useUserStore((state) => state.user?.tenant);
export const useIsAdmin = () => useUserStore((state) => state.user?.role === 'ADMIN');