const PREFIX = 'ts_';
const MAX_BYTES = 5 * 1024 * 1024;
const WARNING_THRESHOLD = MAX_BYTES * 0.9;

const encode = (value: unknown) => JSON.stringify(value);

const decode = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const StorageService = {
  key(key: string) {
    return `${PREFIX}${key}`;
  },

  get<T>(key: string, fallback: T): T {
    return decode<T>(localStorage.getItem(this.key(key)), fallback);
  },

  set<T>(key: string, value: T) {
    localStorage.setItem(this.key(key), encode(value));
    return this.getUsage();
  },

  remove(key: string) {
    localStorage.removeItem(this.key(key));
  },

  clear() {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  },

  getUsage() {
    const bytes = Object.keys(localStorage)
      .filter((key) => key.startsWith(PREFIX))
      .reduce((sum, key) => sum + key.length + (localStorage.getItem(key)?.length ?? 0), 0);

    return {
      bytes,
      maxBytes: MAX_BYTES,
      isNearLimit: bytes >= WARNING_THRESHOLD,
    };
  },
};

export const encodeApiKey = (apiKey: string) => {
  if (!apiKey) return '';
  try {
    return btoa(apiKey);
  } catch {
    return apiKey;
  }
};

export const decodeApiKey = (apiKey: string) => {
  if (!apiKey) return '';
  try {
    return atob(apiKey);
  } catch {
    return apiKey;
  }
};

