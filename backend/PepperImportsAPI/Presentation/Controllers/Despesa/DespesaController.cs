using Microsoft.AspNetCore.Mvc;
using PepperImportsAPI.Application.DTOs.Categoria;
using PepperImportsAPI.Application.DTOs.Despesa;
using PepperImportsAPI.Application.Services;

namespace PepperImportsAPI.Presentation.Controllers.Despesa
{
    [ApiController]
    [Route("api/despesa")]
    public class DespesaController : ControllerBase
    {
        private readonly DespesaService _service;

        public DespesaController(DespesaService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> CreateDespesa(DespesaCreateDTO dto)
        {
            await _service.Create(dto);
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDespesa(int id, DespesaCreateDTO dto)
        {
            await _service.Update(id, dto);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDespesa(int id)
        {
            await _service.Delete(id);
            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> GetAllDespesas()
        {
            var despesas = await _service.GetAll();
            return Ok(despesas);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDespesaById(int id)
        {
            var despesa = await _service.GetById(id);
            if (despesa == null)
                return NotFound();
            return Ok(despesa);
        }

        [HttpGet("nome")]
        public async Task<IActionResult> GetByNomeAsync([FromQuery] string nome)
        {
            var despesa = await _service.GetByNome(nome);
            if (despesa == null)
                return NotFound();
            return Ok(despesa);
        }
    }
}
