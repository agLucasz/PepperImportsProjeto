using Microsoft.AspNetCore.Mvc;
using PepperImportsAPI.Application.DTOs.ContaAPagar;
using PepperImportsAPI.Application.Services;

namespace PepperImportsAPI.Presentation.Controllers.ContaAPagar
{
    [ApiController]
    [Route("api/contaapagar")]
    public class ContaAPagarController : ControllerBase
    {
        private readonly ContaAPagarService _service;

        public ContaAPagarController(ContaAPagarService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> CreateContaAPagar(ContaAPagarCreateDTO dto)
        {
            await _service.Create(dto);
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateContaAPagar(int id, ContaAPagarUpdateDTO dto)
        {
            await _service.Update(id, dto);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteParcela(int id)
        {
            await _service.Delete(id);
            return Ok();
        }

        [HttpDelete("conta/{contaId}")]
        public async Task<IActionResult> DeleteConta(int contaId)
        {
            await _service.DeleteConta(contaId);
            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var contas = await _service.GetAll();
            return Ok(contas);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var conta = await _service.GetById(id);
            if (conta == null)
                return NotFound();
            return Ok(conta);
        }

        [HttpGet("conta/{contaId}")]
        public async Task<IActionResult> GetByContaId(int contaId)
        {
            var parcelas = await _service.GetByContaId(contaId);
            return Ok(parcelas);
        }

        [HttpPatch("{id}/baixa")]
        public async Task<IActionResult> BaixaParcela(int id)
        {
            await _service.BaixaParcela(id);
            return Ok();
        }

        [HttpPatch("conta/{contaId}/baixa")]
        public async Task<IActionResult> BaixaConta(int contaId)
        {
            await _service.BaixaConta(contaId);
            return Ok();
        }
    }
}
