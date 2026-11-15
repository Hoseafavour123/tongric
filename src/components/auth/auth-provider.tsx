"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { resilientFetch } from "@/lib/resilient-fetch";
import type { AuthUserRole } from "@/modules/auth/schemas";

export interface AuthUserSummary {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string | null;
  role: AuthUserRole;
  accountStatus: string;
  preferredLanguageCode: string;
}

export interface AuthContextValue {
  user: AuthUserSummary | null;
  role: AuthUserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (allowedRoles: readonly AuthUserRole[]) => boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: false,
  hasRole: () => false,
  refreshUser: async () => {},
  logout: async () => {},
});

export interface AuthProviderProps {
  initialUser?: AuthUserSummary | null;
  children: ReactNode;
}

export function AuthProvider({ initialUser, children }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUserSummary | null>(initialUser ?? null);
  const [isLoading, setIsLoading] = useState(initialUser === undefined);

  const refreshUser = useCallback(async () => {
    try {
      const res = await resilientFetch<{ user: AuthUserSummary }>("/api/auth/me");
      if (res.ok) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialUser !== undefined) return;

    let active = true;
    resilientFetch<{ user: AuthUserSummary }>("/api/auth/me")
      .then((res) => {
        if (!active) return;
        if (res.ok) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [initialUser]);

  const hasRole = useCallback(
    (allowedRoles: readonly AuthUserRole[]): boolean => {
      if (!user) return false;
      return allowedRoles.includes(user.role);
    },
    [user],
  );

  const logout = useCallback(async () => {
    try {
      await resilientFetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      router.push("/");
      router.refresh();
    }
  }, [router]);

  const value: AuthContextValue = {
    user,
    role: user?.role ?? null,
    isAuthenticated: user !== null,
    isLoading,
    hasRole,
    refreshUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

