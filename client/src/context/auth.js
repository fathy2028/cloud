import axios from "axios";
import { useState, useEffect, useContext, createContext } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(() => {
        const data = localStorage.getItem("auth");
        if (data) {
            const parseData = JSON.parse(data);
            return {
                user: parseData.user,
                token: parseData.token
            };
        } else {
            return {
                user: null,
                token: ""
            };
        }
    });

    useEffect(() => {
        // Set the default Authorization header with the token when auth changes
        if (auth?.token) {
            axios.defaults.headers.common["Authorization"] = auth.token;
        } else {
            delete axios.defaults.headers.common["Authorization"];
        }
    }, [auth]); // This effect runs only when `auth` changes

    return (
        <AuthContext.Provider value={[auth, setAuth]}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);

export { useAuth, AuthProvider };
