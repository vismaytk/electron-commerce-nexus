
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
      document.documentElement.style.setProperty('--background', '224 71% 4%');
      document.documentElement.style.setProperty('--foreground', '213 31% 91%');
      document.documentElement.style.setProperty('--muted', '223 47% 11%');
      document.documentElement.style.setProperty('--muted-foreground', '215 20% 75%');
      document.documentElement.style.setProperty('--popover', '224 71% 4%');
      document.documentElement.style.setProperty('--popover-foreground', '215 20% 95%');
      document.documentElement.style.setProperty('--card', '224 71% 4%');
      document.documentElement.style.setProperty('--card-foreground', '213 31% 91%');
      document.documentElement.style.setProperty('--border', '216 34% 17%');
      document.documentElement.style.setProperty('--input', '216 34% 17%');
      document.documentElement.style.setProperty('--primary', '210 100% 52%');
      document.documentElement.style.setProperty('--primary-foreground', '210 40% 98%');
      document.documentElement.style.setProperty('--secondary', '222 47% 11%');
      document.documentElement.style.setProperty('--secondary-foreground', '210 40% 98%');
      document.documentElement.style.setProperty('--accent', '216 34% 17%');
      document.documentElement.style.setProperty('--accent-foreground', '210 40% 98%');
      document.documentElement.style.setProperty('--ring', '224 76% 48%');
    } else {
      document.documentElement.style.setProperty('--background', '0 0% 100%');
      document.documentElement.style.setProperty('--foreground', '224 71% 4%');
      document.documentElement.style.setProperty('--muted', '220 14% 96%');
      document.documentElement.style.setProperty('--muted-foreground', '220 8% 46%');
      document.documentElement.style.setProperty('--popover', '0 0% 100%');
      document.documentElement.style.setProperty('--popover-foreground', '224 71% 4%');
      document.documentElement.style.setProperty('--card', '0 0% 100%');
      document.documentElement.style.setProperty('--card-foreground', '224 71% 4%');
      document.documentElement.style.setProperty('--border', '220 13% 91%');
      document.documentElement.style.setProperty('--input', '220 13% 91%');
      document.documentElement.style.setProperty('--primary', '221.2 83.2% 53.3%');
      document.documentElement.style.setProperty('--primary-foreground', '210 40% 98%');
      document.documentElement.style.setProperty('--secondary', '220 14% 96%');
      document.documentElement.style.setProperty('--secondary-foreground', '222.2 47.4% 11.2%');
      document.documentElement.style.setProperty('--accent', '220 14% 96%');
      document.documentElement.style.setProperty('--accent-foreground', '222.2 47.4% 11.2%');
      document.documentElement.style.setProperty('--ring', '221.2 83.2% 53.3%');
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
