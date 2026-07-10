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
  uid: string;
  email: string;
  nickname?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  openAuth: () => void;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  openAuth: () => {},
  logout: async () => {},
  updateUser: () => {},
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
        if (data.loggedIn && data.user) {
          setUser({
            uid: data.user.uid || "",
            email: data.user.email,
            nickname: data.user.nickname || data.user.email?.split("@")[0] || "",
            avatarUrl: data.user.avatarUrl || "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // 首页现在是落地页，已登录用户也可以访问

  const openAuth = useCallback(() => {
    setDialogOpen(true);
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  }, [router]);

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const handleLoginSuccess = useCallback(
    async (email: string) => {
      setDialogOpen(false);
      // 登录成功后从服务端拉取完整的用户信息（昵称、头像等）
      // 避免使用 email 前缀作为默认昵称，导致覆盖已保存的信息
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.loggedIn && data.user) {
          setUser({
            uid: data.user.uid || "",
            email: data.user.email,
            nickname: data.user.nickname || email.split("@")[0],
            avatarUrl: data.user.avatarUrl || "",
          });
        } else {
          // 降级：无法获取完整信息时用 email 构造
          setUser({ uid: "", email, nickname: email.split("@")[0], avatarUrl: "" });
        }
      } catch {
        // 网络异常降级
        setUser({ uid: "", email, nickname: email.split("@")[0], avatarUrl: "" });
      }
      router.push("/dashboard");
    },
    [router]
  );

  return (
    <AuthContext.Provider value={{ user, loading, openAuth, logout, updateUser }}>
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
