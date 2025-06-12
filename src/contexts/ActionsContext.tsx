import { actions } from '@/lib/db/actions'
import React, { createContext, useContext } from 'react'

const ActionsContext = createContext(actions)

export const useActions = () => {
  const context = useContext(ActionsContext)
  if (!context) {
    throw new Error('useActions must be used within an ActionsProvider')
  }
  return context
}

export const ActionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ActionsContext.Provider value={actions}>{children}</ActionsContext.Provider>
} 