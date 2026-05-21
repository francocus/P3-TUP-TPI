import { useMemo, useState } from 'react';
import { AuthenticationContext } from './authentication.context';
import { loginUser, registerUser } from './auth.service';

const tokenStorageKey = 'auth-token';
const userStorageKey = 'auth-user';

const storedToken = localStorage.getItem(tokenStorageKey);
const storedUser = localStorage.getItem(userStorageKey);

export const AuthenticationContextProvider = ({ children }) => {
  const [token, setToken] = useState(storedToken);
  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);

  const handleUserLogin = async (credentials) => {
    const response = await loginUser(credentials);

    localStorage.setItem(tokenStorageKey, response.token);
    localStorage.setItem(userStorageKey, JSON.stringify(response.user));

    setToken(response.token);
    setUser(response.user);

    return response;
  };

  const handleUserRegister = async (userData) => {
    return registerUser(userData);
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
