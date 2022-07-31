var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(o => {
    o.AddDefaultPolicy(o => {
        o.AllowAnyOrigin();
        o.AllowAnyMethod();
        o.AllowAnyHeader();
    });
});

builder.Services.AddControllers();
builder.WebHost.UseUrls("http://localhost:3111");


var app = builder.Build();
app.UseCors();
app.UseAuthorization();
app.MapControllers();
app.Run();
