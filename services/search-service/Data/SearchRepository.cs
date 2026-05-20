using Npgsql;
using SearchService.Models;

namespace SearchService.Data
{
    public class SearchRepository
    {
        private readonly string _connectionString;

        public SearchRepository(IConfiguration configuration)
        {
            var host = configuration["DB_HOST"];
            var port = configuration["DB_PORT"];
            var user = configuration["DB_USER"];
            var password = configuration["DB_PASSWORD"];
            var database = configuration["DB_NAME"];

            _connectionString = $"Host={host};Port={port};Username={user};Password={password};Database={database};";
        }

        public async Task<IEnumerable<Hotel>> GetHotelsAsync(string? city)
        {
            Console.WriteLine($"[Search Service] Querying database for hotels (city: {city ?? "all"})...");
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            // await Task.Delay(5000);

            var hotels = new List<Hotel>();
            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            var query = "SELECT id, name, city, price_per_night, available_rooms FROM search_schema.hotels";
            if (!string.IsNullOrEmpty(city))
            {
                query += " WHERE city ILIKE @city";
            }

            using var command = new NpgsqlCommand(query, connection);
            if (!string.IsNullOrEmpty(city))
            {
                command.Parameters.AddWithValue("city", $"%{city}%");
            }

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                hotels.Add(new Hotel
                {
                    Id = reader.GetInt32(0),
                    Name = reader.GetString(1),
                    City = reader.GetString(2),
                    PricePerNight = reader.GetDecimal(3),
                    AvailableRooms = reader.GetInt32(4)
                });
            }

            stopwatch.Stop();
            Console.WriteLine($"[Search Service] Query completed in {stopwatch.ElapsedMilliseconds}ms\n");

            return hotels;
        }

        public async Task<bool> BookRoomsAsync(int hotelId, int roomCount)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            // Check and decrement in one transaction
            using var transaction = await connection.BeginTransactionAsync();

            var checkQuery = "SELECT available_rooms FROM search_schema.hotels WHERE id = @id FOR UPDATE";
            using var checkCmd = new NpgsqlCommand(checkQuery, connection, transaction);
            checkCmd.Parameters.AddWithValue("id", hotelId);

            var result = await checkCmd.ExecuteScalarAsync();
            if (result == null || (int)result < roomCount)
            {
                await transaction.RollbackAsync();
                return false;
            }

            var updateQuery = "UPDATE search_schema.hotels SET available_rooms = available_rooms - @roomCount WHERE id = @id";
            using var updateCmd = new NpgsqlCommand(updateQuery, connection, transaction);
            updateCmd.Parameters.AddWithValue("roomCount", roomCount);
            updateCmd.Parameters.AddWithValue("id", hotelId);

            await updateCmd.ExecuteNonQueryAsync();
            await transaction.CommitAsync();

            return true;
        }
    }
}
