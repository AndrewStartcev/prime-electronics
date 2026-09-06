import { useState, useCallback } from "react";

interface UseTabsReturn<T extends string> {
  activeTab: T;
  setActiveTab: (tab: T) => void;
  isActive: (tab: T) => boolean;
}

export const useTabs = <T extends string>(defaultTab: T): UseTabsReturn<T> => {
  const [activeTab, setActiveTab] = useState<T>(defaultTab);

  const handleSetActiveTab = useCallback((tab: T) => {
    setActiveTab(tab);
  }, []);

  const isActive = useCallback((tab: T) => activeTab === tab, [activeTab]);

  return {
    activeTab,
    setActiveTab: handleSetActiveTab,
    isActive,
  };
};
