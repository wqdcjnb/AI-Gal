"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthDialog } from "./auth-dialog";

interface AuthUser {
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  openAuth: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  openAuth: () => {},
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // 初始加载时检查登录状态
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.loggedIn) {
          setUser(data.user);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // 已登录状态下访问首页 → 自动跳转 Dashboard
  useEffect(() => {
    if (!loading && user && pathname === "/") {
      router.replace("/dashboard");
    }
  }, [loading, user, pathname, router]);

  const openAuth = useCallback(() => {
    setDialogOpen(true);
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  }, [router]);

  const handleLoginSuccess = useCallback(
    (email: string) => {
      setUser({ email });
      setDialogOpen(false);
      // 登录成功后跳转到 Dashboard
      router.push("/dashboard");
    },
    [router]
  );

  return (
    <AuthContext.Provider value={{ user, loading, openAuth, logout }}>
      {children}
      {!user && (
        <AuthDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </AuthContext.Provider>
  );
}
