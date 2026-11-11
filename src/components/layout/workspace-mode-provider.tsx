"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import {
  parseWorkspaceMode,
  WORKSPACE_MODE_STORAGE_KEY,
  type WorkspaceMode,
} from "@/lib/workspace-mode";

const MODE_CHANGE_EVENT = "tongric:workspace-mode-change";

function subscribeMode(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === WORKSPACE_MODE_STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(MODE_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(MODE_CHANGE_EVENT, callback);
  };
}

function getClientSnapshot(): WorkspaceMode {
  if (typeof window === "undefined") {
    return "farmer";
  }
  try {
    return parseWorkspaceMode(
      window.localStorage.getItem(WORKSPACE_MODE_STORAGE_KEY),
    );
  } catch {
    return "farmer";
  }
}

function getServerSnapshot(): WorkspaceMode {
  return "farmer";
}

interface WorkspaceModeContextValue {
  mode: WorkspaceMode;
  setMode: (nextMode: WorkspaceMode) => void;
}

const WorkspaceModeContext = createContext<WorkspaceModeContextValue>({
  mode: "farmer",
  setMode: () => {},
});

export function WorkspaceModeProvider({ children }: { children: ReactNode }) {
  const mode = useSyncExternalStore(
    subscribeMode,
    getClientSnapshot,
    getServerSnapshot,
  );

  const setMode = useCallback((nextMode: WorkspaceMode) => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(WORKSPACE_MODE_STORAGE_KEY, nextMode);
      } catch {
        // Ignore storage quota or private browsing errors cleanly.
      }
      window.dispatchEvent(new Event(MODE_CHANGE_EVENT));
    }
  }, []);

  return (
    <WorkspaceModeContext.Provider value={{ mode, setMode }}>
      {children}
    </WorkspaceModeContext.Provider>
  );
}

export function useWorkspaceMode(): WorkspaceModeContextValue {
  return useContext(WorkspaceModeContext);
}

/**
 * Compact Farmer / Buyer view toggle designed for both mobile and desktop headers.
 * Note: Server RBAC in Phase 3 enforces profile/verification permissions per action.
 */
export function WorkspaceModeSwitch({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { mode, setMode } = useWorkspaceMode();

  return (
    <div
      role="group"
      aria-label="Workspace view mode"
      className="inline-flex rounded-md border border-gray-300 bg-gray-50 p-0.5"
    >
      {(["farmer", "buyer"] as const).map((option) => {
        const isActive = mode === option;
        const label = option === "farmer" ? "Farmer" : "Buyer";
        return (
          <button
            key={option}
            type="button"
            aria-pressed={isActive}
            onClick={() => setMode(option)}
            className={cn(
              "rounded px-2.5 font-medium transition-colors cursor-pointer",
              compact ? "min-h-8 text-xs" : "min-h-9 text-xs sm:text-sm",
              isActive
                ? "bg-green-700 text-white"
                : "text-gray-700 hover:bg-white hover:text-gray-900",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

