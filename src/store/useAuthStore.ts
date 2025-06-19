import { create } from 'zustand';
import { decoder } from '@/utils/';
import Cookies from 'js-cookie';

interface Role {
    name: string;
}

interface UserData {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    status: string;
    organisation: string;
    organisationId: number;
    vcenterOrg_id: string | null;
}

interface AuthState {
    token: string | null;
    user: UserData | null;
    isAuthenticated: boolean;
    role: string | null;
    refresh_token: string | null;
    setToken: (token: string, refresh_token?: string | null) => void;
    setUser: (user: UserData) => void;
    setRole: (role: string) => void;
    logout: () => void;
    syncWithCookies: () => void;
}

const COOKIE_OPTIONS = {
    secure: true,
    sameSite: 'strict' as const,
    expires: 1 // 1 day
};

const getUserFromCookie = (): UserData | null => {
    try {
        const raw = Cookies.get('user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const useAuthStore = create<AuthState>()((set) => {
    let initialToken: string | null = null;
    let initialUser: UserData | null = null;
    let initialRole: string | null = null;

    if (typeof window !== 'undefined') {
        initialToken = Cookies.get('token') || null;
        initialUser = getUserFromCookie();
        initialRole = Cookies.get('role') || initialUser?.role?.name || null;
    }

    return {
        token: initialToken,
        user: initialUser,
        isAuthenticated: !!initialToken,
        role: initialRole,
        refresh_token: null,

        setToken: (token, refresh_token = null) => {
            const decodedToken = decoder(token);

            Cookies.set('token', token, COOKIE_OPTIONS);

            set({
                token,
                refresh_token,
                isAuthenticated: true,
                role: decodedToken?.role || null
            });
        },

        setUser: (user) => {
            Cookies.set('user', JSON.stringify(user), COOKIE_OPTIONS);

            const userRole = user.role?.name || null;
            if (userRole) {
                Cookies.set('role', userRole, COOKIE_OPTIONS);
            }

            set({
                user,
                role: userRole,
                isAuthenticated: true
            });
        },

        setRole: (role) => {
            Cookies.set('role', role, COOKIE_OPTIONS);
            set({ role });
        },

        logout: () => {
            Cookies.remove('token');
            Cookies.remove('user');
            Cookies.remove('role');

            set({
                token: null,
                user: null,
                isAuthenticated: false,
                role: null
            });
        },

        syncWithCookies: () => {
            if (typeof window === 'undefined') return;

            const token = Cookies.get('token') || null;
            const user = getUserFromCookie();
            const role = Cookies.get('role') || user?.role?.name || null;

            set({
                token,
                user,
                isAuthenticated: !!token,
                role
            });
        }
    };
});

export default useAuthStore;
