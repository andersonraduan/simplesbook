'use client'

import { createContext, useContext, ReactNode, useState } from 'react'

interface AppNameContextType {
  appName: string
  isLoading: boolean
  refreshAppName: () => Promise<void>
}

const AppNameContext = createContext<AppNameContextType>({
  appName: 'SimplesBook',
  isLoading: false,
  refreshAppName: async () => {},
})

export function useAppName() {
  return useContext(AppNameContext)
}

interface AppNameProviderProps {
  children: ReactNode
  initialAppName?: string
}

export function AppNameProvider({ children, initialAppName = 'SimplesBook' }: AppNameProviderProps) {
  const [appName, setAppName] = useState(initialAppName)
  const [isLoading, setIsLoading] = useState(false)

  const refreshAppName = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/settings')
      
      if (response.ok) {
        const settings = await response.json()
        if (settings.APP_NAME) {
          setAppName(settings.APP_NAME)
        }
      }
    } catch (error) {
      // Erro de rede - manter valor padrão
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppNameContext.Provider value={{ appName, isLoading, refreshAppName }}>
      {children}
    </AppNameContext.Provider>
  )
}

