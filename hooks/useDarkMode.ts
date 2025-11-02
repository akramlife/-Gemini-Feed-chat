import { useEffect } from 'react';
import useLocalStorage from './useLocalStorage';

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>('darkMode', false);

  useEffect(() => {
    const className = 'dark';
    const element = window.document.documentElement;
    if (isDarkMode) {
      element.classList.add(className);
    } else {
      element.classList.remove(className);
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  return { isDarkMode, toggleDarkMode };
}
