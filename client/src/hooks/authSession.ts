export function clearStaleSession() {
  localStorage.removeItem('user');
  notifyAuthChanged();
}

export function notifyAuthChanged() {
  window.dispatchEvent(new Event('fivis-auth-changed'));
}

export function readIsAuthedFromStorage(): boolean {
  try {
    const user = localStorage.getItem('user');
    return !!JSON.parse(user || '{}')?.id;
  } catch {
    return false;
  }
}
