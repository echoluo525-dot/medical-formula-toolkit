/**
 * Gemini API Key 的本地保管
 *
 * 设计取舍：本站是纯静态站点，不持有任何服务端密钥——
 * 把密钥打进前端 bundle 等于公开泄露，还会替别人付账单。
 * 所以 AI 解读采用「访客自带 Key、只存在自己浏览器」的方式。
 */
const STORAGE_KEY = 'medcalc:gemini-key';

export function getApiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY)?.trim() ?? '';
  } catch {
    return '';
  }
}

export function setApiKey(key: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } catch {
    /* 隐私模式下 localStorage 可能不可用，忽略即可 */
  }
}

export function clearApiKey(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function hasApiKey(): boolean {
  return getApiKey().length > 0;
}
