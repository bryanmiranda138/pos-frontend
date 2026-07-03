import { createContext, useState, useContext } from 'react';

// 1. Creamos el contexto (la "caja" donde guardaremos la memoria)
const AuthContext = createContext();

// 2. Creamos el proveedor que envolverá nuestra app
export const AuthProvider = ({ children }) => {
    // Leemos si ya hay un token guardado de antes
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [rol, setRol] = useState(localStorage.getItem('rol') || null);

    // Función global para iniciar sesión
    const login = (nuevoToken, nuevoRol) => {
        localStorage.setItem('token', nuevoToken);
        localStorage.setItem('rol', nuevoRol);
        setToken(nuevoToken);
        setRol(nuevoRol);
    };

    // Función global para cerrar sesión
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('rol');
        setToken(null);
        setRol(null);
    };

    return (
        <AuthContext.Provider value={{ token, rol, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Un "Hook" personalizado para usar esta memoria fácilmente
export const useAuth = () => useContext(AuthContext);