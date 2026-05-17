/**
 * 사용자 권한 헬퍼
 * - 전체관리자(super admin)는 운영 지역 필터(전체/북구/광산/본부) 등
 *   조직 차원의 UI 요소를 볼 수 있습니다.
 */

const SUPER_ADMIN_ROLES = new Set([
  'SUPER_ADMIN',     // 백엔드 UserRole 표준
  'super_admin',
  'GLOBAL_ADMIN',
  'global_admin',
]);

/** 전체관리자 여부 — user.role 기반 */
export function isSuperAdmin(user) {
  if (!user) return false;
  const role = user.role ?? user.userRole;
  return !!role && SUPER_ADMIN_ROLES.has(role);
}
