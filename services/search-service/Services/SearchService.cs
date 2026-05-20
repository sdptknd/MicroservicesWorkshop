using SearchService.Data;
using SearchService.Models;
using StackExchange.Redis;
using System.Text.Json;

namespace SearchService.Services
{
    public class HotelSearchService
    {
        private readonly SearchRepository _repository;
        private readonly IDatabase _cache;

        public HotelSearchService(SearchRepository repository, IConnectionMultiplexer redis)
        {
            _repository = repository;
            _cache = redis.GetDatabase();
        }

        public async Task<IEnumerable<Hotel>> GetHotelsAsync(string? city)
        {
            string cacheKey = string.IsNullOrEmpty(city) ? "search:hotels:all" : $"search:hotels:{city.ToLower()}";

            // 1. Check Cache
            var cachedData = await _cache.StringGetAsync(cacheKey);
            if (!cachedData.IsNullOrEmpty)
            {
                Console.WriteLine($"[Search Service] ⚡ CACHE HIT for '{cacheKey}'. Returning instantly.");
                return JsonSerializer.Deserialize<IEnumerable<Hotel>>(cachedData!)!;
            }

            // 2. Cache Miss - Fetch from Database
            Console.WriteLine($"[Search Service] 🐌 CACHE MISS for '{cacheKey}'. Delegating to repository...");
            var hotels = await _repository.GetHotelsAsync(city);

            // 3. Store in Cache with TTL
            await _cache.StringSetAsync(cacheKey, JsonSerializer.Serialize(hotels), TimeSpan.FromSeconds(30));

            return hotels;
        }

        public async Task<bool> BookRoomsAsync(int hotelId, int roomCount)
        {
            // Business logic: check if roomCount is valid
            if (roomCount <= 0) return false;

            return await _repository.BookRoomsAsync(hotelId, roomCount);
        }
    }
}
