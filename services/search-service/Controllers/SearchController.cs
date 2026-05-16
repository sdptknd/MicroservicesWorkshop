using Microsoft.AspNetCore.Mvc;
using SearchService.Data;
using SearchService.Models;

namespace SearchService.Controllers
{
    [ApiController]
    [Route("api/search")]
    public class SearchController : ControllerBase
    {
        private readonly SearchRepository _repository;

        public SearchController(SearchRepository repository)
        {
            _repository = repository;
        }

        [HttpGet("hotels")]
        public async Task<IActionResult> GetHotels([FromQuery] string? city)
        {
            var hotels = await _repository.GetHotelsAsync(city);
            return Ok(hotels);
        }

        [HttpPost("hotels/{id}/book")]
        public async Task<IActionResult> BookRooms(int id, [FromBody] BookRequest request)
        {
            var success = await _repository.BookRoomsAsync(id, request.RoomCount);
            if (!success)
            {
                return BadRequest(new { message = "Rooms not available or hotel not found" });
            }

            return Ok(new { message = "Rooms successfully booked" });
        }
    }
}
