var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

builder.Services.AddCors(o => {
    o.AddDefaultPolicy(o => {
        o.AllowAnyOrigin();
        o.AllowAnyMethod();
        o.AllowAnyHeader();
    });
});

builder.WebHost.UseUrls("http://localhost:3111");

var app = builder.Build();

// Configure the HTTP request pipeline.

app.UseAuthorization();

app.MapControllers();

app.Run();
