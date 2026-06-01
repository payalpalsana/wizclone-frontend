import { createContext, useContext, useEffect, useState } from "react";
import { getContext } from "../lib/monday";

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const [workspaceId, setWorkspaceId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getContext()
      .then((ctx) => {
        const id = ctx?.data?.workspaceId ?? ctx?.data?.workspace_id;
        setWorkspaceId(id ?? null);
      })
      .catch(() => setWorkspaceId(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <WorkspaceContext.Provider value={{ workspaceId, loading }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}