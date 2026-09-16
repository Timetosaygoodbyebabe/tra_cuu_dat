using LandPriceApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient();

// Đăng ký Singleton LandPriceStore
builder.Services.AddSingleton<LandPriceStore>();

// Đăng ký IocSyncWorker vừa là Singleton vừa là IHostedService
builder.Services.AddSingleton<IocSyncWorker>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<IocSyncWorker>());

// Cấu hình CORS mở cho Zalo Mini App
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Land Price API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "LandPriceApi .NET 8" }));

app.Run();
