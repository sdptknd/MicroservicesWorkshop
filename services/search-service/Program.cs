using SearchService.Data;
using SearchService.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Register Repository & Service
builder.Services.AddScoped<SearchRepository>();
builder.Services.AddScoped<HotelSearchService>();

var app = builder.Build();

app.UseAuthorization();

app.MapControllers();

// Health check
app.MapGet("/health", () => new { status = "ok", service = "search-service" });

app.Run();

namespace SearchService { }
