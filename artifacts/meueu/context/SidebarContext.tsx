import React, { createContext, useContext, useState, useEffect } from "react";
import { Platform, useWindowDimensions } from "react-native";

const WIDE_BREAKPOINT = 768;

interface SidebarContextType {
  isOpen: boolean;
  isWide: boolean;
  toggle: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  isWide: false,
  toggle: () => {},
  close: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === "web" && width >= WIDE_BREAKPOINT;
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isWide) setIsOpen(false);
  }, [isWide]);

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        isWide,
        toggle: () => setIsOpen((p) => !p),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
