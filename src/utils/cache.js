class SmartCache {
  constructor(ttl = 60000) {
    this.cache = new Map();
    this.ttl = ttl;
    this.hits = 0;
    this.misses = 0;
  }
  
  set(key, value, customTtl = null) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: customTtl || this.ttl
    });
    
    if (this.cache.size > 100) {
      this.cleanup();
    }
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) {
      this.misses++;
      return null;
    }
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }
    
    this.hits++;
    return item.value;
  }
  
  async fetchOrGet(key, fetcher, options = {}) {
    const cached = this.get(key);
    if (cached && !options.forceRefresh) return cached;
    
    const fresh = await fetcher();
    this.set(key, fresh, options.ttl);
    return fresh;
  }
  
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
  
  getStats() {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: total === 0 ? '0%' : (this.hits / total * 100).toFixed(1) + '%',
      size: this.cache.size
    };
  }
  
  clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }
}

export const cache = new SmartCache(60000);