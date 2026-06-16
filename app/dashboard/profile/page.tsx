"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  UserCircle,
  Camera,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

const ALLOWED_AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"]
const MAX_AVATAR_SIZE = 5 * 1024 * 1024 // 5MB


export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // ---- 昵称编辑状态 ----
  const [nickname, setNickname] = useState("")
  const [originalNickname, setOriginalNickname] = useState("")
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  // ---- 头像编辑状态 ----
  const [avatarUrl, setAvatarUrl] = useState("")           // 已保存的头像 URL
  const [avatarPreview, setAvatarPreview] = useState("")    // 选图后的本地预览（object URL）
  const [pendingFile, setPendingFile] = useState<File | null>(null) // 待确认的文件
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState("")
  const [imgLoadFailed, setImgLoadFailed] = useState(false) // 图片加载失败时的降级

  // ---- 密码修改状态 ----
  const [passwordStep, setPasswordStep] = useState<"idle" | "code-sent">("idle")
  const [sendingCode, setSendingCode] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [verificationId, setVerificationId] = useState("")
  const [passwordCode, setPasswordCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordMsg, setPasswordMsg] = useState("")
  const [passwordMsgOk, setPasswordMsgOk] = useState(false)

  // 初始加载：从服务端拉取用户扩展信息
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/user/profile")
      const data = await res.json()
      if (data.success && data.data) {
        setNickname(data.data.nickname)
        setOriginalNickname(data.data.nickname)
        setAvatarUrl(data.data.avatarUrl || user?.avatarUrl || "")
      } else if (user?.nickname) {
        // 降级：用 AuthContext 中的 nickname
        setNickname(user.nickname)
        setOriginalNickname(user.nickname)
      }
    } catch {
      // 网络异常时用 AuthContext 中的昵称兜底
      if (user?.nickname) {
        setNickname(user.nickname)
        setOriginalNickname(user.nickname)
      }
    } finally {
      setLoadingProfile(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // 保存昵称到数据库
  const handleSave = async () => {
    const trimmed = nickname.trim()
    if (!trimmed) {
      setSaveStatus("error")
      setErrorMessage("昵称不能为空")
      return
    }
    if (trimmed === originalNickname) {
      setSaveStatus("success")
      setTimeout(() => setSaveStatus("idle"), 2000)
      return
    }

    setSaving(true)
    setSaveStatus("idle")
    setErrorMessage("")

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: trimmed }),
      })
      const data = await res.json()

      if (data.success) {
        setNickname(trimmed)
        setOriginalNickname(trimmed)
        setSaveStatus("success")
        // 同步到 AuthContext → Topbar 实时更新
        updateUser({ nickname: trimmed })
        setTimeout(() => setSaveStatus("idle"), 2000)
      } else {
        setSaveStatus("error")
        setErrorMessage(data.message || "保存失败")
      }
    } catch {
      setSaveStatus("error")
      setErrorMessage("网络错误，请稍后重试")
    } finally {
      setSaving(false)
    }
  }

  // 步骤 1：选择文件 → 仅显示预览，不自动上传
  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 校验类型
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError("仅支持 PNG、JPG、WebP、GIF 格式")
      return
    }
    // 校验大小
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError("图片大小不能超过 5MB")
      return
    }

    setAvatarError("")
    // 显示本地预览，暂存文件等待确认
    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)
    setPendingFile(file)
    // 重置 input 以允许重复选择同一文件
    if (avatarInputRef.current) avatarInputRef.current.value = ""
  }

  // 步骤 2：用户点击确认 → 上传到服务器
  const handleConfirmAvatar = async () => {
    if (!pendingFile) return
    const file = pendingFile

    setUploadingAvatar(true)
    setAvatarError("")
    try {
      const formData = new FormData()
      formData.append("avatar", file)

      const res = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (data.success && data.data) {
        // 上传成功：清除预览状态
        clearAvatarPreview()
        setImgLoadFailed(false)

        // 从服务端重新拉取用户信息
        // GET /api/user/profile 内部通过 resolveAvatarUrl 将 fileId 解析为临时 URL
        const profileRes = await fetch("/api/user/profile")
        const profileData = await profileRes.json()

        let resolvedUrl = data.data.avatarUrl // 兜底：上传接口返回的临时 URL
        if (profileData.success && profileData.data?.avatarUrl) {
          resolvedUrl = profileData.data.avatarUrl
        }

        // 更新本地状态 + AuthContext（保证 Topbar 同步）
        setAvatarUrl(resolvedUrl)
        updateUser({ avatarUrl: resolvedUrl })
      } else {
        setAvatarError(data.message || "上传失败")
      }
    } catch {
      setAvatarError("网络错误，请稍后重试")
    } finally {
      setUploadingAvatar(false)
    }
  }

  // 步骤 2 取消：放弃预览，恢复旧头像
  const handleCancelAvatar = () => {
    setAvatarError("")
    clearAvatarPreview()
  }

  // 清理预览状态
  const clearAvatarPreview = () => {
    if (avatarPreview && avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview)
    }
    setAvatarPreview("")
    setPendingFile(null)
  }

  // ---- 密码修改处理 ----
  const handleSendCode = async () => {
    setSendingCode(true)
    setPasswordMsg("")
    setPasswordMsgOk(false)
    setVerificationId("")
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send-code" }),
      })
      const data = await res.json()
      if (data.success && data.verificationId) {
        setVerificationId(data.verificationId)
        setPasswordStep("code-sent")
        setPasswordMsg("验证码已发送到您的邮箱，请查收")
        setPasswordMsgOk(true)
      } else {
        setPasswordMsg(data.message || "发送失败")
      }
    } catch {
      setPasswordMsg("网络错误，请稍后重试")
    } finally {
      setSendingCode(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordCode.length < 6) {
      setPasswordMsg("请输入 6 位验证码")
      setPasswordMsgOk(false)
      return
    }
    if (newPassword.length < 6) {
      setPasswordMsg("新密码至少需要 6 个字符")
      setPasswordMsgOk(false)
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg("两次输入的密码不一致")
      setPasswordMsgOk(false)
      return
    }
    if (!verificationId) {
      setPasswordMsg("验证会话已过期，请重新发送验证码")
      setPasswordMsgOk(false)
      return
    }

    setChangingPassword(true)
    setPasswordMsg("")
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset",
          code: passwordCode,
          password: newPassword,
          verificationId,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setPasswordStep("idle")
        setPasswordCode("")
        setNewPassword("")
        setConfirmPassword("")
        setVerificationId("")
        setPasswordMsg("密码修改成功，即将跳转到首页...")
        setPasswordMsgOk(true)
        // 密码修改后 cookie 已清除，刷新页面触发重新登录
        setTimeout(() => {
          window.location.href = "/"
        }, 2000)
      } else {
        setPasswordMsg(data.message || "修改失败")
        setPasswordMsgOk(false)
      }
    } catch {
      setPasswordMsg("网络错误，请稍后重试")
      setPasswordMsgOk(false)
    } finally {
      setChangingPassword(false)
    }
  }

  const hasChanges = nickname.trim() !== originalNickname

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">个人中心</h1>
        <p className="text-muted-foreground mt-1">管理你的个人信息和账户设置</p>
      </div>

      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserCircle className="h-4 w-4 text-purple-500" />
            基本信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar */}
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleAvatarSelect}
            className="hidden"
            aria-label="选择头像图片"
          />

          {/* 预览确认栏：选图后显示 */}
          {pendingFile && (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-purple-500/30 bg-purple-500/5">
              <img
                src={avatarPreview}
                alt="头像预览"
                className="h-16 w-16 rounded-full object-cover border-2 border-purple-500"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">新头像预览</p>
                <p className="text-xs text-muted-foreground">
                  {pendingFile.name} ({(pendingFile.size / 1024).toFixed(1)} KB)
                </p>
                {avatarError && (
                  <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {avatarError}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleConfirmAvatar}
                  disabled={uploadingAvatar}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  确认
                </Button>
                <Button
                  onClick={handleCancelAvatar}
                  disabled={uploadingAvatar}
                  variant="outline"
                  size="sm"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  取消
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="relative group cursor-pointer disabled:cursor-wait"
                title="点击更换头像"
              >
                {avatarUrl && !avatarPreview && !imgLoadFailed ? (
                  // 已保存的头像
                  <div className="relative">
                    <img
                      key={avatarUrl}
                      src={avatarUrl}
                      alt={nickname}
                      className="h-20 w-20 rounded-full object-cover border-2 border-border group-hover:border-purple-500 transition-colors"
                      onError={() => setImgLoadFailed(true)}
                    />
                  </div>
                ) : avatarPreview ? (
                  // 选图预览中（褪色显示旧头像）
                  <div className="relative">
                    <img
                      src={avatarPreview}
                      alt="预览"
                      className="h-20 w-20 rounded-full object-cover border-2 border-purple-500 opacity-70"
                    />
                    <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center">
                      <Camera className="h-5 w-5 text-white" />
                    </div>
                  </div>
                ) : (
                  // 无头像时显示首字母渐变圆圈
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:opacity-80 transition-opacity">
                    <span className="text-white text-2xl font-bold">
                      {nickname[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}
                {/* 悬浮相机图标 */}
                {!pendingFile && (
                  <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                    <Camera className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                  </div>
                )}
              </button>
              {/* 底部小相机按钮 */}
              {!pendingFile && (
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-background border border-border flex items-center justify-center hover:bg-accent transition-colors shadow-sm"
                  title="更换头像"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div>
              {loadingProfile ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <p className="font-medium">{nickname}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  {avatarError && (
                    <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {avatarError}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* 昵称输入 */}
          <div className="space-y-2">
            <Label>昵称</Label>
            <Input
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value)
                setSaveStatus("idle")
              }}
              placeholder="输入你的昵称"
              maxLength={30}
              disabled={loadingProfile}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === "Enter") handleSave()
              }}
            />
            <p className="text-xs text-muted-foreground">
              {nickname.length}/30 个字符
            </p>
          </div>

          {/* 保存按钮 + 状态提示 */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges || loadingProfile}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : saveStatus === "success" ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  已保存
                </>
              ) : (
                "保存修改"
              )}
            </Button>

            {saveStatus === "error" && errorMessage && (
              <span className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errorMessage}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 修改密码 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4 text-purple-500" />
            修改密码
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 步骤 1：发送验证码 */}
          <div className="space-y-2">
            <Label>邮箱验证</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground flex-1">
                {user?.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendCode}
                disabled={sendingCode || passwordStep === "code-sent"}
              >
                {sendingCode ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : passwordStep === "code-sent" ? (
                  "已发送"
                ) : (
                  "发送验证码"
                )}
              </Button>
            </div>
          </div>

          {/* 步骤 2：输入验证码 */}
          {passwordStep === "code-sent" && (
            <div className="space-y-2">
              <Label>验证码</Label>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={passwordCode}
                onChange={(e) => {
                  setPasswordCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  setPasswordMsg("")
                }}
                placeholder="输入 6 位验证码"
                className="font-mono tracking-[0.3em]"
              />
            </div>
          )}

          {/* 步骤 3：输入新密码 */}
          {passwordStep === "code-sent" && (
            <>
              <div className="space-y-2">
                <Label>新密码</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    setPasswordMsg("")
                  }}
                  placeholder="输入新密码"
                />
                {newPassword.length > 0 && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                    {[
                      { label: "≥6 位", ok: newPassword.length >= 6 },
                      { label: "大写字母", ok: /[A-Z]/.test(newPassword) },
                      { label: "小写字母", ok: /[a-z]/.test(newPassword) },
                      { label: "数字", ok: /[0-9]/.test(newPassword) },
                      { label: "特殊字符", ok: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(newPassword) },
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
              </div>
              <div className="space-y-2">
                <Label>确认新密码</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setPasswordMsg("")
                  }}
                  placeholder="再次输入新密码"
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === "Enter") handleChangePassword()
                  }}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500">两次输入的密码不一致</p>
                )}
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="w-full"
              >
                {changingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    修改中...
                  </>
                ) : (
                  "确认修改密码"
                )}
              </Button>
            </>
          )}

          {/* 消息提示 */}
          {passwordMsg && (
            <p
              className={`text-sm flex items-center gap-1 ${
                passwordMsgOk ? "text-green-500" : "text-red-500"
              }`}
            >
              {passwordMsgOk ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5" />
              )}
              {passwordMsg}
            </p>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
