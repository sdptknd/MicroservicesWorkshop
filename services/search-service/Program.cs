using SearchService.Data;
using SearchService.Services;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Configure Redis
var redisHost = builder.Configuration["REDIS_HOST"] ?? "localhost:6379";
builder.Services.AddSingleton<IConnectionMultiplexer>(ConnectionMultiplexer.Connect(redisHost));

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
