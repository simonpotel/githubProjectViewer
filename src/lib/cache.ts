interface CacheEntry<T> {
  data: T;
  timestamp: number;
  etag?: string;
  lastModified?: string;
}

interface Cache {
  [key: string]: CacheEntry<any>;
}

class CacheManager {
  private static instance: CacheManager;
  private cache: Cache = {};
  private readonly CACHE_DURATION = 3600000; // 1 hour in milliseconds
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    this.startCleanupInterval();
    this.loadFromStorage();
    window.addEventListener('beforeunload', () => this.saveToStorage());
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private startCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cleanupInterval = setInterval(() => this.clearExpiredCache(), this.CACHE_DURATION);
  }

  private clearExpiredCache(): void {
    const now = Date.now();
    let hasChanges = false;
    Object.keys(this.cache).forEach(key => {
      if (now - this.cache[key].timestamp > this.CACHE_DURATION) {
        delete this.cache[key];
        hasChanges = true;
      }
    });
    if (hasChanges) {
      this.saveToStorage();
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('github_cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        const now = Date.now();
        Object.keys(parsed).forEach(key => {
          if (now - parsed[key].timestamp <= this.CACHE_DURATION) {
            this.cache[key] = parsed[key];
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
      this.cache = {};
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('github_cache', JSON.stringify(this.cache));
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
    }
  }

  public set<T>(key: string, data: T, metadata: { etag?: string; lastModified?: string } = {}): void {
    this.cache[key] = {
      data,
      timestamp: Date.now(),
      ...metadata
    };
    this.saveToStorage();
  }

  public get<T>(key: string): { data: T | null; metadata: { etag?: string; lastModified?: string } } {
    const entry = this.cache[key];
    if (!entry) {
      return { data: null, metadata: {} };
    }

    const now = Date.now();
    if (now - entry.timestamp > this.CACHE_DURATION) {
      delete this.cache[key];
      this.saveToStorage();
      return { data: null, metadata: {} };
    }

    return {
      data: entry.data as T,
      metadata: {
        etag: entry.etag,
        lastModified: entry.lastModified
      }
    };
  }

  public clear(): void {
    this.cache = {};
    this.saveToStorage();
  }

  public getCacheSize(): number {
    return Object.keys(this.cache).length;
  }

  public getEntryAge(key: string): number | null {
    const entry = this.cache[key];
    if (!entry) return null;
    return Date.now() - entry.timestamp;
  }
}

export const cacheManager = CacheManager.getInstance(); 