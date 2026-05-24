using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PepperImportsAPI.Application.DTOs.Usuario;
using PepperImportsAPI.Application.Services;

namespace PepperImportsAPI.Presentation.Controllers.Usuario
{
    [ApiController]
    [Route("api/usuario")]
    public class UsuarioController : ControllerBase
    {
        private readonly UsuarioService _service;
        public UsuarioController(UsuarioService service)
        {
            _service = service;
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> CreateUsuario(UsuarioCreateDTO dto)
        {
            await _service.Create(dto);
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUsuario(int id, UsuarioCreateDTO dto)
        {
            await _service.Update(id, dto);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUsuario(int id)
        {
            await _service.Delete(id);
            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsuarios()
        {
            var usuarios = await _service.GetAll();
            return Ok(usuarios);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUsuarioById(int id)
        {
            var usuario = await _service.GetById(id);
            if (usuario == null)
                return NotFound();
            return Ok(usuario);
        }

        [HttpGet("email")]
        public async Task<IActionResult> GetByEmailAsync([FromQuery] string email)
        {
            var usuario = await _service.GetByEmail(email);
            if (usuario == null)
                return NotFound();
            return Ok(usuario);
        }

    }
}
