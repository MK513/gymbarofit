export function isAdminDomain() {
  return window.location.hostname === 'admin.lvh.me';
}

export function isMemberDomain() {
  const h = window.location.hostname;
  return h === 'lvh.me' || h === 'localhost';
}

export function getMemberBaseUrl() {
  return 'http://lvh.me:5173';
}

export function getAdminBaseUrl() {
  return 'http://admin.lvh.me:5173';
}

export function getCorrectDomainForRole(role) {
  return role === 'owner' ? getAdminBaseUrl() : getMemberBaseUrl();
}

export function isOnCorrectDomain(role) {
  return role === 'owner' ? isAdminDomain() : isMemberDomain();
}

/** localhost 접속 시 lvh.me로 리다이렉트 (path/search/hash 유지) */
export function redirectIfLocalhost() {
  if (window.location.hostname === 'localhost') {
    const { pathname, search, hash } = window.location;
    window.location.replace(`http://lvh.me:5173${pathname}${search}${hash}`);
    return true;
  }
  return false;
}
