
import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check for saved theme in localStorage or use system preference
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) return savedTheme;
    
    // Check for system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  // Apply theme class to document and set CSS variables for better contrast
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    
    // Set custom CSS variables for better contrast
    if (theme === 'dark') {
      document.documentElement.style.setProperty('--background', '240 10% 3.9%');
      document.documentElement.style.setProperty('--foreground', '0 0% 98%');
      document.documentElement.style.setProperty('--muted', '240 3.7% 15.9%');
      document.documentElement.style.setProperty('--muted-foreground', '240 5% 84.9%');
      document.documentElement.style.setProperty('--card', '240 10% 3.9%');
      document.documentElement.style.setProperty('--card-foreground', '0 0% 98%');
      document.documentElement.style.setProperty('--border', '240 3.7% 15.9%');
    } else {
      document.documentElement.style.setProperty('--background', '0 0% 100%');
      document.documentElement.style.setProperty('--foreground', '240 10% 3.9%');
      document.documentElement.style.setProperty('--muted', '240 4.8% 95.9%');
      document.documentElement.style.setProperty('--muted-foreground', '240 3.8% 46.1%');
      document.documentElement.style.setProperty('--card', '0 0% 100%');
      document.documentElement.style.setProperty('--card-foreground', '240 10% 3.9%');
      document.documentElement.style.setProperty('--border', '240 5.9% 90%');
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
