using Microsoft.AspNetCore.Mvc;
using PepperImportsAPI.Application.DTOs.Categoria;
using PepperImportsAPI.Application.Services;

namespace PepperImportsAPI.Presentation.Controllers.Categoria
{
    [ApiController]
    [Route("api/categoria")]
    public class CategoriaController : ControllerBase
    {
        private readonly CategoriaService _service;

        public CategoriaController(CategoriaService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> CreateCategoria(CategoriaCreateDTO dto)
        {
            await _service.Create(dto);
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategoria(int id, CategoriaCreateDTO dto)
        {
            await _service.Update(id, dto);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategoria(int id)
        {
            await _service.Delete(id);
            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCategorias()
        {
            var categorias = await _service.GetAll();
            return Ok(categorias);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategoriaById(int id)
        {
            var categoria = await _service.GetById(id);
            if (categoria == null)
                return NotFound();
            return Ok(categoria);
        }

        [HttpGet("nome")]
        public async Task<IActionResult> GetByNomeAsync([FromQuery] string nome)
        {
            var categoria = await _service.GetByNome(nome);
            if (categoria == null)
                return NotFound();
            return Ok(categoria);
        }
    }
}
