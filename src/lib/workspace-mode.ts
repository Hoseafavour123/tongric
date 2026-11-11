export type WorkspaceMode = "farmer" | "buyer";

export const WORKSPACE_MODE_STORAGE_KEY = "tongric_workspace_mode";

export function parseWorkspaceMode(value: unknown): WorkspaceMode {
  return value === "buyer" ? "buyer" : "farmer";
}

