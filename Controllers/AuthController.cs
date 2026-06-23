using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using 数据库课程设计.Data;
using 数据库课程设计.Models;

namespace 数据库课程设计.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // 登录请求模型
        public class LoginRequest
        {
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // 1. 查找用户
            var user = await _context.Users
                .Include(u => u.Student)
                .FirstOrDefaultAsync(u => u.Username == request.Username);

            if (user == null || !user.IsActive)
            {
                return Unauthorized(new { message = "用户名或密码错误" });
            }

            // 2. 验证密码（这里用简单哈希比对，后续可以升级为 BCrypt）
            if (!VerifyPassword(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "用户名或密码错误" });
            }

            // 3. 生成 JWT Token
            var token = GenerateJwtToken(user);

            // 4. 返回 Token 和用户信息
            return Ok(new
            {
                token,
                user = new
                {
                    user.UserId,
                    user.Username,
                    user.Role,
                    StudentName = user.Student?.Name
                }
            });
        }

        // 密码验证（简单哈希，生产环境建议用 BCrypt）
        private bool VerifyPassword(string inputPassword, string storedHash)
        {
            // 这里用简单 SHA256 哈希对比
            using var sha256 = System.Security.Cryptography.SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(inputPassword);
            var hash = sha256.ComputeHash(bytes);
            var hashString = Convert.ToBase64String(hash);

            Console.WriteLine($"Input: {inputPassword}, Computed Hash: {hashString}, Stored: {storedHash}");

            return hashString == storedHash;
        }

        // 生成 JWT Token
        private string GenerateJwtToken(User user)
        {
            var jwtKey = _configuration["Jwt:Key"] ?? "defaultkey12345678901234567890123456";
            var key = Encoding.UTF8.GetBytes(jwtKey);
            var issuer = _configuration["Jwt:Issuer"] ?? "DormitorySystem";
            var audience = _configuration["Jwt:Audience"] ?? "DormitoryFrontend";
            var expireMinutes = int.Parse(_configuration["Jwt:ExpireMinutes"] ?? "120");

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("StudentId", user.StudentId?.ToString() ?? "")
            };

            var credentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256
            );

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.Now.AddMinutes(expireMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}