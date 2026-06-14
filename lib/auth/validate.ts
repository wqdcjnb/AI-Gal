/**
 * 密码强度校验
 */
export function validatePasswordStrength(password: string): {
  valid: boolean
  message: string
  checks: { label: string; passed: boolean }[]
} {
  const checks = [
    { label: "至少 6 个字符", passed: password.length >= 6 },
  ];
  const allPassed = checks.every((c) => c.passed);
  return {
    valid: allPassed,
    message: allPassed ? "密码可用" : "密码至少需要 6 个字符",
    checks,
  };
}
