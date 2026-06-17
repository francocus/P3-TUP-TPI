import { useState } from 'react';
import { AuthenticationContext } from './authentication.context';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';
const TOKEN_KEY = 'legal-manager-token';
const USER_KEY = 'legal-manager-user';

const readStoredValue = (key, fallback = null) => {
  try {
    const storedValue = localStorage.getItem(key);

    if (!storedValue) {
      return fallback;
    }

    return JSON.parse(storedValue);
  } catch (_error) {
    return fallback;
  }
};

const getErrorMessage = async (response) => {
  try {
    const payload = await response.json();
    return payload?.message || 'No se pudo completar la operacion.';
  } catch (_error) {
    return 'No se pudo completar la operacion.';
  }
};

export const AuthenticationContextProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => readStoredValue(USER_KEY));

  const persistSession = (nextToken, nextUser) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const handleUserLogin = async (credentials) => {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    const data = await response.json();
    persistSession(data.token, data.user);

    return data;
  };

  const handleUserRegister = async (form) => {
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    return handleUserLogin({
      email: form.email,
      password: form.password,
    });
  };

  const handleUserLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const contextValue = {
    token,
    user,
    isAuthenticated: Boolean(token),
    handleUserLogin,
    handleUserRegister,
    handleUserLogout,
  };

  return (
    <AuthenticationContext.Provider value={contextValue}>
      {children}
    </AuthenticationContext.Provider>
  );
};
