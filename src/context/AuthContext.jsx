import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const savedUser = localStorage.getItem('pizzeria_user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        } catch (error) {
            console.error('Error parsing stored user data:', error);
            localStorage.removeItem('pizzeria_user');
            localStorage.removeItem('pizzeria_token');
        } finally {
            setLoading(false);
        }
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('pizzeria_user', JSON.stringify(userData));
    };

    const updateUser = (newFields) => {
        const updatedUser = { ...user, ...newFields };
        setUser(updatedUser);
        localStorage.setItem('pizzeria_user', JSON.stringify(updatedUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('pizzeria_user');
        localStorage.removeItem('pizzeria_token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
