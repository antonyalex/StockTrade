import { useState, useEffect } from 'react';
import { loginUser, registerUser } from '../api/services';
import { AuthContext } from './ContextDef';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await loginUser(email, password);
            const { user: userData, token } = response.data;

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', token);

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message || 'Login failed' };
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password) => {
        setLoading(true);
        try {
            const response = await registerUser(name, email, password);
            const { user: userData, token } = response.data;

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', token);

            return { success: true };
        } catch (error) {
            const msg = error.response?.data?.error || error.message || 'Registration failed';
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

