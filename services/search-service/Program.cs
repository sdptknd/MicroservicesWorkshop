using SearchService.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Register Repository
builder.Services.AddScoped<SearchRepository>();

var app = builder.Build();

app.UseAuthorization();

app.MapControllers();

// Health check
app.MapGet("/health", () => new { status = "ok", service = "search-service" });

app.Run();

namespace SearchService { }
