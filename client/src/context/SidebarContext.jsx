import React, { createContext } from 'react';

export const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const isSidebarOpen = true;

  return (
    <SidebarContext.Provider value={{ isSidebarOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};
