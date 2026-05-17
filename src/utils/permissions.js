/**
 * 사용자 권한 헬퍼
 */

const SUPER_ADMIN_ROLES = new Set([
  'SUPER_ADMIN', 'super_admin',
  'GLOBAL_ADMIN', 'global_admin',
]);

const REGION_ADMIN_ROLES = new Set([
  'BONBU_ADMIN', 'bonbu_admin',
  'GWANGSAN_ADMIN', 'gwangsan_admin',
  'BUKGU_ADMIN', 'bukgu_admin',
  'ADMIN', 'admin',
]);

const JIPA_ROLES = new Set(['JIPA', 'jipa']);

const ROLE_TO_REGION = {
  BONBU_ADMIN: '본부', bonbu_admin: '본부',
  GWANGSAN_ADMIN: '광산', gwangsan_admin: '광산',
  BUKGU_ADMIN: '북구', bukgu_admin: '북구',
};

/** 전체관리자 여부 */
export function isSuperAdmin(user) {
  if (!user) return false;
  const role = user.role ?? user.userRole;
  return !!role && SUPER_ADMIN_ROLES.has(role);
}

/** 지역관리자 여부 */
export function isRegionAdmin(user) {
  if (!user) return false;
  const role = user.role ?? user.userRole;
  return !!role && REGION_ADMIN_ROLES.has(role);
}

/** 전체관리자 또는 지역관리자 여부 */
export function isAnyAdmin(user) {
  return isSuperAdmin(user) || isRegionAdmin(user);
}

/**
 * 지파 유저 여부
 * - 전체 지역에 걸친 클럽 개설 권한 보유
 * - SUPER_ADMIN도 동일 권한 포함
 */
export function isJipa(user) {
  if (!user) return false;
  const role = user.role ?? user.userRole;
  return !!role && (JIPA_ROLES.has(role) || SUPER_ADMIN_ROLES.has(role));
}

/** 지역관리자의 담당 지역 반환 (없으면 null) */
export function getAdminRegion(user) {
  if (!user) return null;
  const role = user.role ?? user.userRole;
  return ROLE_TO_REGION[role] ?? null;
}
