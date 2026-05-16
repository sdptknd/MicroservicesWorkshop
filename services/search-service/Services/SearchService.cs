using SearchService.Data;
using SearchService.Models;

namespace SearchService.Services
{
    public class HotelSearchService
    {
        private readonly SearchRepository _repository;

        public HotelSearchService(SearchRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Hotel>> GetHotelsAsync(string? city)
        {
            // Here you could add business logic, caching, etc.
            return await _repository.GetHotelsAsync(city);
        }

        public async Task<bool> BookRoomsAsync(int hotelId, int roomCount)
        {
            // Business logic: check if roomCount is valid
            if (roomCount <= 0) return false;

            return await _repository.BookRoomsAsync(hotelId, roomCount);
        }
    }
}
