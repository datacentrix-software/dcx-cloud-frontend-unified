import { create } from 'zustand';
import Cookies from 'js-cookie';
import { decoder } from '@/utils';
import { IUser } from '@/types/IUser';
import { getUserRoleDisplay } from '@/app/(DashboardLayout)/utilities/helpers/user';

interface AuthState {
    token: string | null;
    user: IUser | null;
    isAuthenticated: boolean;
    roles: string | null;
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
    expires: 1 // 1 day
};

const getUserFromCookie = (): IUser | null => {
    try {
        const raw = Cookies.get('user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const useAuthStore = create<AuthState>()((set) => {
    let initialToken: string | null = null;
    let initialUser: IUser | null = null;
    let initialRoles: string | null = null;

    if (typeof window !== 'undefined') {
        initialToken = Cookies.get('token') || null;
        initialUser = getUserFromCookie();
        initialRoles = getUserRoleDisplay(initialUser);
    }

    return {
        token: initialToken,
        user: initialUser,
        isAuthenticated: !!initialToken,
        roles: initialRoles,
        refresh_token: null,

        setToken: (token, refresh_token = null) => {
            const decodedToken = decoder(token);

            Cookies.set('token', token, COOKIE_OPTIONS);

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

            if (userRole) {
                Cookies.set('roles', userRole, COOKIE_OPTIONS);
            }

            set({
                user,
                roles: userRole,
                isAuthenticated: true
            });
        },

        setRoles: (roles) => {
            Cookies.set('roles', roles, COOKIE_OPTIONS);
            set({ roles });
        },

        logout: () => {
            Cookies.remove('token');
            Cookies.remove('user');
            Cookies.remove('roles');

            set({
                token: null,
                user: null,
                isAuthenticated: false,
                roles: null
            });
        },

        syncWithCookies: () => {
            if (typeof window === 'undefined') return;

            const token = Cookies.get('token') || null;
            const user = getUserFromCookie();
            const roles = getUserRoleDisplay(user);

            set({
                token,
                user,
                isAuthenticated: !!token,
                roles
            });
        }
    };
});

export default useAuthStore;
