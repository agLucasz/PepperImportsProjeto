using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PepperImportsAPI.Application.DTOs.Venda;
using PepperImportsAPI.Application.Services;

namespace PepperImportsAPI.Presentation.Controllers.Venda
{

    [Authorize]
    [ApiController]
    [Route("api/venda")]
    public class VendaController : ControllerBase
    {
        private readonly VendaService _service;

        public VendaController(VendaService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> CreatePedido(VendaCreateDTO dto)
        {
            await _service.Create(dto);
            return Ok();
        }

        [HttpPost("{id}/itens")]
        public async Task<IActionResult> AddItem(int id, VendaItemCreateDTO dto)
        {
            await _service.AddItem(id, dto);
            return Ok();
        }

        [HttpPatch("{id}/reabrir")]
        public async Task<IActionResult> ReopenVenda(int id)
        {
            await _service.ReopenVenda(id);
            return Ok();
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelVenda(int id)
        {
            await _service.Cancel(id);
            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> GetAllVendas()
        {
            var vendas = await _service.GetAll();
            return Ok(vendas);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetVendaById(int id)
        {
            var venda = await _service.GetById(id);
            return Ok(venda);
        }
    }
}
