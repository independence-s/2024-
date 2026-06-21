using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using 数据库课程设计.Data;

var builder = WebApplication.CreateBuilder(args);

// 添加服务到容器
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 注册数据库上下文（连接 SQL Server）
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowVueFronted", policy =>
    {
        policy.WithOrigins("http://localhost:5173")//Vue开发服务器默认端口
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); //需要携带Cookie/认证信息
    });
});

var app = builder.Build();

// 配置 HTTP 请求管道
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowVueFrontend");
app.UseAuthorization();
app.MapControllers();

app.Run();