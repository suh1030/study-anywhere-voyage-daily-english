import React, { createContext, useContext, useState } from 'react'

type TabName = 'Listen' | 'Conversation' | 'Review' | 'Speak' | 'Schedule'

interface NavContextType {
  activeTab: TabName
  navigate: (tab: TabName) => void
}

const NavContext = createContext<NavContextType>({
  activeTab: 'Listen',
  navigate: () => {},
})

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabName>('Listen')
  return (
    <NavContext.Provider value={{ activeTab, navigate: setActiveTab }}>
      {children}
    </NavContext.Provider>
  )
}

export function useNav() {
  return useContext(NavContext)
}
