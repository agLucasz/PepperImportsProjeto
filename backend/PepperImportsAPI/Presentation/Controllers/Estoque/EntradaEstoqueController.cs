using Microsoft.AspNetCore.Mvc;
using PepperImportsAPI.Application.DTOs.Estoque;
using PepperImportsAPI.Application.Services;

namespace PepperImportsAPI.Presentation.Controllers.Estoque
{
    [ApiController]
    [Route("api/entrada-estoque")]
    public class EntradaEstoqueController : ControllerBase
    {
        private readonly EntradaEstoqueService _service;
        public EntradaEstoqueController(EntradaEstoqueService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> ToThrowEstoque(EntradaEstoqueCreateDTO dto)
        {
            await _service.ToThrow(dto);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEntradaEstoque(int id)
        {
            await _service.Delete(id);
            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> GetAllEntradasEstoque()
        {
            var entradasEstoque = await _service.GetAll();
            return Ok(entradasEstoque);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetEntradaEstoqueById(int id)
        {
            var entradaEstoque = await _service.GetById(id);
            if (entradaEstoque == null)
                return NotFound();
            return Ok(entradaEstoque);
        }
    }
}
