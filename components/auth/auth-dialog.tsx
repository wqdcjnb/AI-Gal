"use client";

import { useState } from "react";
import {
  X,
  Mail,
  Lock,
  Loader2,
  UserPlus,
  LogIn,
  KeyRound,
} from "lucide-react";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess: (email: string) => void;
}

type Mode = "login" | "register";
type LoginMethod = "password" | "code";

export function AuthDialog({
  open,
  onOpenChange,
  onLoginSuccess,
}: AuthDialogProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("password");

  // 共享状态
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!open) return null;

  const reset = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setCode("");
    setVerificationId("");
    setCodeSent(false);
    setMessage("");
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    reset();
  };

  // 发送验证码
  const handleSendCode = async () => {
    if (!email.includes("@")) {
      setMessage("请输入有效的邮箱地址");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          type: mode === "register" ? "signup" : "signin",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setVerificationId(data.verificationId);
        setCodeSent(true);
        setMessage("验证码已发送到您的邮箱，请查收");
      } else {
        setMessage(data.message || "发送失败");
      }
    } catch {
      setMessage("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 登录
  const handleLogin = async () => {
    if (!email.includes("@")) {
      setMessage("请输入有效的邮箱地址");
      return;
    }

    if (loginMethod === "password" && password.length < 6) {
      setMessage("密码至少需要 6 个字符");
      return;
    }
    if (loginMethod === "code" && code.length < 6) {
      setMessage("请输入 6 位验证码");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const body: Record<string, string> = { email: email.trim().toLowerCase() };

      if (loginMethod === "password") {
        body.type = "password";
        body.password = password;
      } else {
        body.type = "code";
        body.verificationCode = code;
        body.verificationId = verificationId;
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        handleClose();
        onLoginSuccess(email.trim().toLowerCase());
      } else {
        setMessage(data.message || "登录失败");
      }
    } catch {
      setMessage("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 注册
  const handleRegister = async () => {
    if (!email.includes("@")) {
      setMessage("请输入有效的邮箱地址");
      return;
    }
    if (password.length < 6) {
      setMessage("密码至少需要 6 个字符");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("两次输入的密码不一致");
      return;
    }
    if (code.length < 6) {
      setMessage("请输入邮箱中的验证码");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          verificationCode: code,
          verificationId,
        }),
      });
      const data = await res.json();

      if (data.success) {
        handleClose();
        onLoginSuccess(email.trim().toLowerCase());
      } else {
        setMessage(data.message || "注册失败");
      }
    } catch {
      setMessage("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const title =
    mode === "login"
      ? loginMethod === "password"
        ? "密码登录"
        : "验证码登录"
      : "注册";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative z-10 w-full max-w-sm mx-4 bg-background border border-border rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="flex items-center gap-2">
            {mode === "login" ? (
              <LogIn className="h-4 w-4 text-muted-foreground" />
            ) : (
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            )}
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-md hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 pb-6">
          <p className="text-sm text-muted-foreground mb-6">
            {mode === "register"
              ? "创建账号，验证码将发送到您的邮箱"
              : "登录您的账号"}
          </p>

          {/* Login method toggle */}
          {mode === "login" && (
            <div className="flex gap-1 p-1 mb-5 bg-muted rounded-lg">
              <button
                onClick={() => {
                  setLoginMethod("password");
                  setMessage("");
                }}
                className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${
                  loginMethod === "password"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Lock className="h-3.5 w-3.5 inline mr-1" />
                密码
              </button>
              <button
                onClick={() => {
                  setLoginMethod("code");
                  setMessage("");
                }}
                className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${
                  loginMethod === "code"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <KeyRound className="h-3.5 w-3.5 inline mr-1" />
                验证码
              </button>
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                autoFocus
              />
            </div>

            {/* Password (login-password mode or register) */}
            {(mode === "register" || loginMethod === "password") && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="密码"
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
                />
              </div>
            )}

            {/* Confirm password (register only) */}
            {mode === "register" && (
              <>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="确认密码"
                    className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500 -mt-2">两次输入的密码不一致</p>
                )}
                {/* 密码强度指示器 */}
                {password.length > 0 && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs -mt-1">
                    {[
                      { label: "≥6 位", ok: password.length >= 6 },
                      { label: "大写字母", ok: /[A-Z]/.test(password) },
                      { label: "小写字母", ok: /[a-z]/.test(password) },
                      { label: "数字", ok: /[0-9]/.test(password) },
                      { label: "特殊字符", ok: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password) },
                    ].map((check) => (
                      <span
                        key={check.label}
                        className={check.ok ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}
                      >
                        {check.ok ? "✓" : "○"} {check.label}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Send code button / Code input */}
            {mode === "register" && !codeSent && (
              <button
                onClick={handleSendCode}
                disabled={loading}
                className="w-full h-10 rounded-lg border border-input bg-background text-sm font-medium hover:bg-accent disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                发送验证码到邮箱
              </button>
            )}

            {(mode === "register" || loginMethod === "code") && codeSent && (
              <>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="输入 6 位验证码"
                    className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm font-mono tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleSendCode}
                  disabled={loading}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  未收到邮件？重新发送
                </button>
              </>
            )}

            {/* Login code mode: send code button */}
            {mode === "login" && loginMethod === "code" && !codeSent && (
              <button
                onClick={handleSendCode}
                disabled={loading}
                className="w-full h-10 rounded-lg border border-input bg-background text-sm font-medium hover:bg-accent disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                发送验证码到邮箱
              </button>
            )}

            {/* Submit Button */}
            {mode === "register" ? (
              <button
                onClick={handleRegister}
                disabled={loading || !codeSent}
                className="w-full h-10 rounded-lg bg-foreground text-background font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <UserPlus className="h-4 w-4" />
                注册并登录
              </button>
            ) : loginMethod === "password" ? (
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full h-10 rounded-lg bg-foreground text-background font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <LogIn className="h-4 w-4" />
                登录
              </button>
            ) : (
              codeSent && (
                <button
                  onClick={handleLogin}
                  disabled={loading || code.length < 6}
                  className="w-full h-10 rounded-lg bg-foreground text-background font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <LogIn className="h-4 w-4" />
                  验证并登录
                </button>
              )
            )}
          </div>

          {/* Message */}
          {message && (
            <p
              className={`mt-4 text-sm text-center ${
                message.includes("成功") || message.includes("发送")
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}

          {/* Toggle Mode */}
          <p className="mt-6 text-sm text-center text-muted-foreground">
            {mode === "login" ? "还没有账号？" : "已有账号？"}
            <button
              onClick={switchMode}
              className="ml-1 text-foreground font-medium hover:underline"
            >
              {mode === "login" ? "立即注册" : "去登录"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
