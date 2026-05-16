namespace SearchService.Models
{
    public class Hotel
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public decimal PricePerNight { get; set; }
        public int AvailableRooms { get; set; }
    }

    public class BookRequest
    {
        public int RoomCount { get; set; }
    }
}
