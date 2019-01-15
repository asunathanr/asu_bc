class Cache {
  constructor() {
    this.cache = new Map();
  }

  has(key) {
    return this.cache.has(key);
  }

  get(key) {
    return this.get(key);
  }

  add(key, value) {
    return this.cache.set(key, value);
  }
}

export default Cache;