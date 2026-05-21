import { useMemo, useState } from 'react';
import { AuthenticationContext } from './authentication.context';

const tokenStorageKey = 'auth-token';
const userStorageKey = 'auth-user';
const apiBaseUrl = 'http://localhost:4000/api/users';

const storedToken = localStorage.getItem(tokenStorageKey);
const storedUser = localStorage.getItem(userStorageKey);

const parseJsonResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Ocurrio un error en la solicitud.');
  }

  return data;
};

export const AuthenticationContextProvider = ({ children }) => {
  const [token, setToken] = useState(storedToken);
  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);

  const handleUserLogin = async (credentials) => {
    const response = await fetch(`${apiBaseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await parseJsonResponse(response);

    localStorage.setItem(tokenStorageKey, data.token);
    localStorage.setItem(userStorageKey, JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);

    return data;
  };

  const handleUserRegister = async (userData) => {
    const response = await fetch(`${apiBaseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    return parseJsonResponse(response);
  };

  const handleUserLogout = () => {
    localStorage.removeItem(tokenStorageKey);
    localStorage.removeItem(userStorageKey);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      handleUserLogin,
      handleUserRegister,
      handleUserLogout,
    }),
    [token, user]
  );

  return (
    <AuthenticationContext.Provider value={value}>
      {children}
    </AuthenticationContext.Provider>
  );
};
