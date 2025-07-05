import { create } from 'zustand';
import Cookies from 'js-cookie';
import { decoder } from '@/utils';
import { IUser } from '@/types/IUser';
import { getUserRoleDisplay } from '@/app/(DashboardLayout)/utilities/helpers/user.helper';

interface AuthState {
  token: string | null;
  user: IUser | null;
  isAuthenticated: boolean;
  roles: string | null;
  orgIds: string[];
  primaryOrgId: string | null;
  refresh_token: string | null;
  setToken: (token: string, refresh_token?: string | null) => void;
  setUser: (user: IUser) => void;
  setRoles: (roles: string) => void;
  logout: () => void;
  syncWithCookies: () => void;
}

const COOKIE_OPTIONS = {
  secure: true,
  sameSite: 'strict' as const,
  expires: 1
};

const getUserFromCookie = (): IUser | null => {
  try {
    const raw = Cookies.get('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const extractOrgIds = (user: IUser | null): string[] => {
  if (!user?.roles) return [];
  return user.roles.map(r => r.orgId);
};

const useAuthStore = create<AuthState>()((set, get) => {
  let initialToken: string | null = null;
  let initialUser: IUser | null = null;
  let initialRoles: string | null = null;
  let initialOrgIds: string[] = [];
  let initialPrimaryOrgId: string | null = null;
  let initialRefreshToken: string | null = null;

  if (typeof window !== 'undefined') {
    initialToken = Cookies.get('token') || null;
    initialRefreshToken = Cookies.get('refresh_token') || null;
    initialUser = getUserFromCookie();
    initialRoles = getUserRoleDisplay(initialUser);
    initialOrgIds = extractOrgIds(initialUser);
    initialPrimaryOrgId = initialOrgIds[0] || null;
  }

  return {
    token: initialToken,
    user: initialUser,
    isAuthenticated: !!initialToken,
    roles: initialRoles,
    orgIds: initialOrgIds,
    primaryOrgId: initialPrimaryOrgId,
    refresh_token: initialRefreshToken,

    setToken: (token, refresh_token = null) => {
      const decodedToken = decoder(token);
      Cookies.set('token', token, COOKIE_OPTIONS);
      
      if (refresh_token) {
        Cookies.set('refresh_token', refresh_token, COOKIE_OPTIONS);
      }

      set({
        token,
        refresh_token,
        isAuthenticated: true,
        roles: decodedToken?.role || null
      });
    },

    setUser: (user) => {
      Cookies.set('user', JSON.stringify(user), COOKIE_OPTIONS);
      const userRole = getUserRoleDisplay(user);
      const orgIds = extractOrgIds(user);
      const primaryOrgId = orgIds[0] || null;

      if (userRole) {
        Cookies.set('roles', userRole, COOKIE_OPTIONS);
      }

      set({
        user,
        roles: userRole,
        isAuthenticated: true,
        orgIds,
        primaryOrgId
      });
    },

    setRoles: (roles) => {
      Cookies.set('roles', roles, COOKIE_OPTIONS);
      set({ roles });
    },

    logout: () => {
      Cookies.remove('token');
      Cookies.remove('refresh_token');
      Cookies.remove('user');
      Cookies.remove('roles');

      set({
        token: null,
        refresh_token: null,
        user: null,
        isAuthenticated: false,
        roles: null,
        orgIds: [],
        primaryOrgId: null
      });
    },

    syncWithCookies: () => {
      if (typeof window === 'undefined') return;

      const token = Cookies.get('token') || null;
      const refresh_token = Cookies.get('refresh_token') || null;
      const user = getUserFromCookie();
      const roles = getUserRoleDisplay(user);
      const orgIds = extractOrgIds(user);
      const primaryOrgId = orgIds[0] || null;

      set({
        token,
        refresh_token,
        user,
        isAuthenticated: !!token,
        roles,
        orgIds,
        primaryOrgId
      });
    }
  };
});

export default useAuthStore;
