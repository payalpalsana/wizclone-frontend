import { createContext, useContext, useEffect, useState } from 'react'
import { listenToTheme } from '../lib/monday'

const ThemeContext = createContext('light')

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) setTheme('dark')

    try {
      listenToTheme((res) => {
        if (res?.data?.theme === 'dark' || res?.data?.theme === 'black') {
          setTheme('dark')
        } else {
          setTheme('light')
        }
      })
    } catch (_) {}
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
