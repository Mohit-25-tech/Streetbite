import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('user')) || null; } catch { return null; }
    });
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);

    // Verify token on mount
    useEffect(() => {
        const token = sessionStorage.getItem('accessToken');
        if (token) {
            authAPI.getMe()
                .then(({ data }) => setUser(data.user))
                .catch(() => {
                    sessionStorage.removeItem('accessToken');
                    sessionStorage.removeItem('refreshToken');
                    sessionStorage.removeItem('user');
                    setUser(null);
                })
                .finally(() => setInitializing(false));
        } else {
            setInitializing(false);
        }
    }, []);

    const login = useCallback(async (email, password) => {
        setLoading(true);
        try {
            const { data } = await authAPI.login({ email, password });
            sessionStorage.setItem('accessToken', data.accessToken);
            sessionStorage.setItem('refreshToken', data.refreshToken);
            sessionStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            toast.success(`Welcome back, ${data.user.name}! 🎉`);
            return { success: true, user: data.user };
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed.';
            toast.error(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async (formData) => {
        setLoading(true);
        try {
            const { data } = await authAPI.register(formData);
            sessionStorage.setItem('accessToken', data.accessToken);
            sessionStorage.setItem('refreshToken', data.refreshToken);
            sessionStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            toast.success(`Welcome to StreetBite, ${data.user.name}! 🍜`);
            return { success: true, user: data.user };
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed.';
            toast.error(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try { await authAPI.logout(); } catch { }
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');
        setUser(null);
        toast.success('Logged out. See you soon! 👋');
    }, []);

    const updateUser = useCallback((updatedUser) => {
        setUser(updatedUser);
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, initializing, login, register, logout, updateUser, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

export default AuthContext;
