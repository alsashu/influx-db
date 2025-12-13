public class ExpiringCache<TKey, TValue> where TKey : notnull
{
private class CacheItem
{
public TValue Value { get; set; }
public DateTime ExpiresAt { get; set; }

        public CacheItem(TValue value, DateTime expiresAt)
        {
            Value = value;
            ExpiresAt = expiresAt;
        }

        public bool IsExpired => DateTime.UtcNow > ExpiresAt;
    }

    private readonly ConcurrentDictionary<TKey, CacheItem> _cache;
    private readonly TimeSpan _defaultExpiration;
    private readonly Timer _cleanupTimer;

    public ExpiringCache(TimeSpan defaultExpiration, TimeSpan? cleanupInterval = null)
    {
        _cache = new ConcurrentDictionary<TKey, CacheItem>();
        _defaultExpiration = defaultExpiration;

        var interval = cleanupInterval ?? TimeSpan.FromMinutes(5);
        _cleanupTimer = new Timer(
            _ => Cleanup(),
            null,
            interval,
            interval);
    }

    public void Set(TKey key, TValue value, TimeSpan? expiration = null)
    {
        var expiresAt = DateTime.UtcNow + (expiration ?? _defaultExpiration);
        var item = new CacheItem(value, expiresAt);
        _cache[key] = item;
    }

    public bool TryGet(TKey key, out TValue? value)
    {
        if (_cache.TryGetValue(key, out var item))
        {
            if (!item.IsExpired)
            {
                value = item.Value;
                return true;
            }

            _cache.TryRemove(key, out _);
        }

        value = default;
        return false;
    }

    public TValue GetOrAdd(TKey key, Func<TKey, TValue> valueFactory, TimeSpan? expiration = null)
    {
        if (TryGet(key, out var value) && value != null)
            return value;

        var newValue = valueFactory(key);
        Set(key, newValue, expiration);
        return newValue;
    }

    public async Task<TValue> GetOrAddAsync(
        TKey key,
        Func<TKey, Task<TValue>> valueFactory,
        TimeSpan? expiration = null)
    {
        if (TryGet(key, out var value) && value != null)
            return value;

        var newValue = await valueFactory(key);
        Set(key, newValue, expiration);
        return newValue;
    }

    public void Remove(TKey key)
    {
        _cache.TryRemove(key, out _);
    }

    public void Clear()
    {
        _cache.Clear();
    }

    private void Cleanup()
    {
        var expiredKeys = _cache
            .Where(kvp => kvp.Value.IsExpired)
            .Select(kvp => kvp.Key)
            .ToList();

        foreach (var key in expiredKeys)
        {
            _cache.TryRemove(key, out _);
        }
    }

    public void Dispose()
    {
        _cleanupTimer?.Dispose();
    }

}
