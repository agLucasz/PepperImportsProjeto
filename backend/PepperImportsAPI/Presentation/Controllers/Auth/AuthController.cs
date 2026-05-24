using Microsoft.AspNetCore.Mvc;
using PepperImportsAPI.Application.DTOs.Auth;
using PepperImportsAPI.Application.Services.Auth;

namespace PepperImportsAPI.Presentation.Controllers.Auth
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _service;

        public AuthController(AuthService authService)
        {
            _service = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequestDTO dto)
        {
            var resultado = await _service.Login(dto);
            return Ok(resultado);
        }
    }
}
