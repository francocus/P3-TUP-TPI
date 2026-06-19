import { useEffect, useState } from "react";
import { ThemeContext } from "./theme.context";
import { DARK_THEME, LIGHT_THEME } from "../consts/themeConsts";

const getInitialTheme = () => {
    const stored = localStorage.getItem("theme");
    if (stored === DARK_THEME || stored === LIGHT_THEME) return stored;

    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? DARK_THEME
        : LIGHT_THEME;
};

export const ThemeContextProvider = ({ children }) => {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        document.documentElement.setAttribute("data-bs-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === LIGHT_THEME ? DARK_THEME : LIGHT_THEME));
    };

    return (
        <ThemeContext value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext>
    );
};