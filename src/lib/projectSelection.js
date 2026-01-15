"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ProjectSelectionContext = createContext(null);

export function ProjectSelectionProvider({ children }) {
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("selectedProjectId");
    if (stored) {
      setSelectedProjectId(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (selectedProjectId) {
      window.localStorage.setItem("selectedProjectId", selectedProjectId);
    } else {
      window.localStorage.removeItem("selectedProjectId");
    }
  }, [selectedProjectId]);

  const value = useMemo(
    () => ({ selectedProjectId, setSelectedProjectId }),
    [selectedProjectId]
  );

  return (
    <ProjectSelectionContext.Provider value={value}>
      {children}
    </ProjectSelectionContext.Provider>
  );
}

export function useProjectSelection() {
  const context = useContext(ProjectSelectionContext);
  if (!context) {
    throw new Error(
      "useProjectSelection must be used within ProjectSelectionProvider"
    );
  }
  return context;
}
