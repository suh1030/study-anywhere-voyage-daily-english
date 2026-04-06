import React, { createContext, useContext, useState } from 'react'

type TabName = 'Listen' | 'Conversation' | 'Review' | 'Speak' | 'Schedule' | 'Account'

interface NavContextType {
  activeTab: TabName
  navigate: (tab: TabName) => void
}

const NavContext = createContext<NavContextType>({
  activeTab: 'Schedule',
  navigate: () => {},
})

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabName>('Schedule')
  return (
    <NavContext.Provider value={{ activeTab, navigate: setActiveTab }}>
      {children}
    </NavContext.Provider>
  )
}

export function useNav() {
  return useContext(NavContext)
}
