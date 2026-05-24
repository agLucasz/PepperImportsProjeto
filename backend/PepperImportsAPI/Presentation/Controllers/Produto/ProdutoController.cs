using Microsoft.AspNetCore.Mvc;
using PepperImportsAPI.Application.DTOs.Produto;
using PepperImportsAPI.Application.Services;

namespace PepperImportsAPI.Presentation.Controllers.Produto
{
    [ApiController]
    [Route("api/produto")]
    public class ProdutoController : ControllerBase
    {
        private readonly ProdutoService _service;

        public ProdutoController(ProdutoService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> CreateProduto(ProdutoCreateDTO dto)
        {
            await _service.Create(dto);
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduto(int id, ProdutoCreateDTO dto)
        {
            await _service.Update(id, dto);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduto(int id)
        {
            await _service.Delete(id);
            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> GetAllProdutos()
        {
            var produtos = await _service.GetAll();
            return Ok(produtos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProdutoById(int id)
        {
            var categoriaProduto = await _service.GetById(id);
            if (categoriaProduto == null)
                return NotFound();
            return Ok(categoriaProduto);
        }
    }
}
