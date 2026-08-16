import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeId, AVAILABLE_THEMES, ThemeOption, BusinessBrandTheme, isValidTheme, applyBrandTheme } from './theme';

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  availableThemes: ThemeOption[];
  brand: BusinessBrandTheme | null;
  setBrandTheme: (brand: BusinessBrandTheme | null) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'streetcraft-theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && isValidTheme(saved)) {
        return saved;
      }
    }
    return 'paper';
  });

  const [brand, setBrandState] = useState<BusinessBrandTheme | null>(null);

  const setTheme = (next: ThemeId) => {
    setThemeState(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.setAttribute('data-theme', next);
    }
  };

  const setBrandTheme = (nextBrand: BusinessBrandTheme | null) => {
    setBrandState(nextBrand);
    applyBrandTheme(nextBrand);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        availableThemes: AVAILABLE_THEMES,
        brand,
        setBrandTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
