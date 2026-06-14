# CloudBase 修改密码功能 — 调试过程总结

> 目标：已登录用户通过邮箱验证码修改自己的登录密码。
> 环境：CloudBase Auth v1，环境 ID `wqd-d9gb53fy5b6613e69`。

---

## 1. 背景

**初始实现**：

- `sendPasswordChangeCode` — 调用 Admin API `POST /auth/v1/verification` 发送邮箱验证码
- `modifyPassword` — 调用 `PATCH /auth/v1/user/password` 修改密码

**现象**：API 返回成功，但密码实际未变更。

---

## 2. 所有失败尝试

### 架构总览

项目中存在三种 CloudBase API 调用方式：

| 调用方式 | 函数 | 目标域名 | 鉴权 |
|----------|------|----------|------|
| Admin Auth v1 HTTP | `authApi` → `cloudbaseRequest` | `service.tcloudbase.com` | SDK 内部签名 + admin token |
| User Auth v1 HTTP | `userAuthApi` | `service.tcloudbase.com` → 后改为 `api.tcloudbasegateway.com` | `Bearer <user_token>` |
| Admin Action | `tcbapicaller.request` | `tcb-api.tencentcloudapi.com/admin` | SDK 内部签名 |
| WEDA 管理端 | `fetch` 直接调用 | `tcb-api.tencentcloudapi.com/weda/...` | `Bearer <admin_token>` |
| **腾讯云公网 API** | `callTencentCloudAPI` | `tcb.tencentcloudapi.com` | **TC3-HMAC-SHA256 签名** |

---

### 尝试 1：userAuthApi (service.tcloudbase.com) + user token

**调用链**：
```
modifyPassword
  → userAuthApi("/user/password", { new_password, confirm_password, verify_code })
    → PATCH https://xxx.service.tcloudbase.com/auth/v1/user/password
      Authorization: Bearer <user_token>
```

**错误**：`sudo required`

**根因**：
- `service.tcloudbase.com` 是 Admin API 专用域名，用户级操作应使用 `api.tcloudbasegateway.com`
- user token 缺少 "sudo" scope（需要先通过 reauthenticate 升级 session）

---

### 尝试 2：authApi (cloudbaseRequest) + admin token

**调用链**：
```
modifyPassword
  → authApi("/user/password", { uid, new_password, ... }, adminToken, "PATCH")
    → cloudbaseRequest (SDK admin 签名 + admin token)
```

**错误**：`want user token but you got client_credentials token`

**根因**：`PATCH /auth/v1/user/password` 端点**只接受 user token**，不接受 admin 的 `client_credentials` token。

---

### 尝试 3：userAuthApi + reauthenticate (api.tcloudbasegateway.com)

**调用链**：
```
sendPasswordChangeCode
  → userAuthApi("/user/reauthenticate", { verify_opt: "email_code" }, userToken)
    → POST https://xxx.api.tcloudbasegateway.com/auth/v1/user/reauthenticate
      Authorization: Bearer <user_token>
```

**错误**：`method Reauthenticate not implemented`

**根因**：该 CloudBase 环境**未实现** reauthenticate 端点。标准 Auth v1 密码修改流程（reauthenticate → 获取 sudo scope → PATCH password）在此环境断裂。

---

### 尝试 4：WEDA 管理端 API

**调用链**：
```
modifyPassword
  → fetch("https://xxx.ap-shanghai.tcb-api.tencentcloudapi.com/weda/auth/v1.1/prod/updateUserInfoByUserId")
    Authorization: Bearer <admin_token>
    Body: { Uuid, Password }
```

**错误**：`PERMISSION_DENIED` / `no permission`

**根因**：
- WEDA API 需要控制台用户的认证凭证
- `client_credentials` 类型的 admin token **没有 WEDA API 的调用权限**
- 控制台用户通过 Tencent Cloud 账号登录后拥有完整的管理权限，但服务端 SDK 的 `client_credentials` token 权限受限

**额外发现**：代码中 WEDA 响应的错误检测不完整——只检查了 `body.Error` 和 `body.error`，遗漏了 `body.code` 字段，导致一度误报成功。

---

### 尝试 5：tcbapicaller admin actions

**调用链**：
```
modifyPassword
  → tcbapicaller.request({
      params: { action: "auth.updateUserInfoForAdmin", uuid, password }
    })
```

尝试了 3 个 action 名：
- `auth.updateUserInfoForAdmin`
- `auth.modifyPasswordForAdmin`
- `auth.updateUser`

**错误**：`Invalid action`（三者均失败）

**根因**：CloudBase Admin API (`tcb-api.tencentcloudapi.com/admin`) **不存在**这些 action。该 API 的可用 action 有限（如 `auth.getUserInfoForAdmin` 是存在的），但密码管理不在其中。

---

### 尝试 6：userAuthApi + admin 验证码凭证

**调用链**：
```
modifyPassword
  → userAuthApi("/user/password", {
      new_password, confirm_password,
      verify_code, verification_id  // admin API 发出的验证凭证
    }, userAccessToken, "PATCH")
    → PATCH https://xxx.api.tcloudbasegateway.com/auth/v1/user/password
      Authorization: Bearer <user_token>
```

**错误**：`sudo required`

**根因**：Admin API (`/auth/v1/verification`) 发出的验证码 + `verification_id` **不能**给 user token 授予 "sudo" scope。仅 reauthenticate 端点能升级 session，但该端点不可用。

---

## 3. 最终方案：腾讯云公网 TCB API `ModifyUser`

### 为什么能成功

腾讯云 TCB 服务有独立的公网管理 API `ModifyUser`：

- **不依赖** Auth v1 的 reauthenticate / sudo 机制
- **不依赖** WEDA 管理端权限
- 使用 **TC3-HMAC-SHA256 签名**（标准的腾讯云 API 鉴权方式），直接使用 `TENCENTCLOUD_SECRETID` / `TENCENTCLOUD_SECRETKEY`
- 这是**管理员级别**的 API，直接修改指定用户的密码

### API 详情

| 项目 | 内容 |
|------|------|
| **Action** | `ModifyUser` |
| **域名** | `tcb.tencentcloudapi.com` |
| **Version** | `2018-06-08` |
| **参数** | `EnvId`, `Uid`, `Password` |

### 完整流程

```
用户点击"发送验证码"
  → sendPasswordChangeCode(userToken)
    → 从 JWT 解析 email
    → Admin API: POST /auth/v1/verification { email, type: "signup" }
    → ✅ 验证码发送到邮箱，返回 verificationId

用户输入验证码 + 新密码
  → modifyPassword(userToken, newPassword, verifyCode, verificationId)
    → Step 1: 验证验证码
        Admin API: POST /auth/v1/verification/verify
        { verification_id, verification_code }
        → 获取 verification_token ✓
    → Step 2: 修改密码
        TC3 签名 → POST https://tcb.tencentcloudapi.com/
        Headers: X-TC-Action: ModifyUser, X-TC-Version: 2018-06-08, ...
        Body: { EnvId, Uid, Password }
        → ✅ 密码修改成功
```

### TC3 签名实现要点

```typescript
// 1. 构建 Canonical Request
const canonicalHeaders = `content-type:application/json\nhost:tcb.tencentcloudapi.com\n`
const canonicalRequest = `POST\n/\n\n${canonicalHeaders}\ncontent-type;host\n${sha256(body)}`

// 2. 构建 String to Sign
const stringToSign = `TC3-HMAC-SHA256\n${timestamp}\n${date}/tcb/tc3_request\n${sha256(canonicalRequest)}`

// 3. 计算签名
const secretDate = hmacSha256(`TC3${secretKey}`, date)
const secretService = hmacSha256(secretDate, "tcb")
const secretSigning = hmacSha256(secretService, "tc3_request")
const signature = hmacSha256(secretSigning, stringToSign).toString("hex")

// 4. Authorization 头
`TC3-HMAC-SHA256 Credential=${secretId}/${date}/tcb/tc3_request, SignedHeaders=content-type;host, Signature=${signature}`
```

### 关键代码位置

| 文件 | 函数 | 作用 |
|------|------|------|
| [lib/cloudbase-auth.ts](lib/cloudbase-auth.ts) | `callTencentCloudAPI()` | 通用 TC3 签名 + 腾讯云 API 调用 |
| [lib/cloudbase-auth.ts](lib/cloudbase-auth.ts) | `sha256()` / `hmacSha256()` | TC3 签名所需的加密原语 |
| [lib/cloudbase-auth.ts](lib/cloudbase-auth.ts) | `modifyPassword()` | 先验证验证码，再调 ModifyUser |
| [lib/cloudbase-auth.ts](lib/cloudbase-auth.ts) | `sendPasswordChangeCode()` | 从 JWT 解析 email，调 admin API 发验证码 |
| [app/api/user/password/route.ts](app/api/user/password/route.ts) | `POST` | API 路由，支持 `send-code` / `reset` |
| [app/dashboard/profile/page.tsx](app/dashboard/profile/page.tsx) | `handleSendCode` / `handleChangePassword` | 前端密码修改 UI |

## 4. 关键经验

1. **CloudBase 有三套 API 体系**，权限和能力各不相同：
   - Auth v1 HTTP API — 用户注册/登录/验证码，密码修改需要 reauthenticate
   - 管理端 API (tcb-api / WEDA) — 需要控制台级别的认证
   - 腾讯云公网 API — TC3 签名，管理员权限，最完整

2. **不要混淆域名**：
   - `service.tcloudbase.com` — Admin auth v1
   - `api.tcloudbasegateway.com` — User auth v1
   - `tcb-api.tencentcloudapi.com` — 管理端 / WEDA
   - `tcb.tencentcloudapi.com` — 腾讯云公网 API

3. **Admin token (`client_credentials`) 权限有限**：只能调 auth v1 admin 端点（signup、verification 等），不能调 WEDA 管理 API。

4. **错误检测要覆盖多种响应格式**：CloudBase 不同 API 返回的错误字段包括 `error`、`code`、`Error.Code` 等，不能只检查一种。
