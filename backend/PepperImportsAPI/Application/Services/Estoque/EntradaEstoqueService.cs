using PepperImportsAPI.Application.DTOs.Estoque;
using PepperImportsAPI.Application.Interfaces;
using PepperImportsAPI.Application.Interfaces.Estoque;
using PepperImportsAPI.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace PepperImportsAPI.Application.Services
{
    public class EntradaEstoqueService
    {
        private readonly IEntradaEstoqueRepository _repository;
        private readonly IProdutoRepository _produtoRepository;

        public EntradaEstoqueService(IEntradaEstoqueRepository repository, IProdutoRepository produtoRepository)
        {
            _repository = repository;
            _produtoRepository = produtoRepository;
        }

        public async Task ToThrow(EntradaEstoqueCreateDTO dto)
        {
            var produto = await _produtoRepository.GetByIdAsync(dto.ProdutoId);
            if (produto == null)
                throw new Exception("Produto não encontrado!");

            if (dto.QuantidadeEntrada <= 0)
                throw new ValidationException("Quantidade do produto deve ser maior que zero.");

            // Encontra o bucket do tamanho informado
            var estoque = produto.Estoques.FirstOrDefault(e => e.Tamanho == dto.Tamanho);
            if (estoque == null)
                throw new Exception($"O produto não possui estoque configurado para o tamanho '{dto.Tamanho}'. Edite o produto e adicione o tamanho.");

            var dataEntrada = dto.DataEntrada == default
                ? DateTime.UtcNow
                : DateTime.SpecifyKind(dto.DataEntrada, DateTimeKind.Utc);

            var entradaEstoque = new EntradaEstoque
            {
                ProdutoId = dto.ProdutoId,
                Tamanho = dto.Tamanho,
                QuantidadeEntrada = dto.QuantidadeEntrada,
                DataEntrada = dataEntrada
            };

            // Incrementa o estoque do tamanho correto
            estoque.Quantidade += dto.QuantidadeEntrada;

            await _repository.AddAsync(entradaEstoque);

            // Persiste a alteração no estoque
            await _produtoRepository.UpdateAsync(produto);
        }

        public async Task Delete(int id)
        {
            var entradaEstoque = await _repository.GetByIdAsync(id);
            if (entradaEstoque == null)
                throw new Exception("Entrada de estoque não encontrada.");

            await _repository.DeleteAsync(id);
        }

        public async Task<List<EntradaEstoqueDTO>> GetAll()
        {
            var entradasEstoque = await _repository.GetAllAsync();

            return entradasEstoque.Select(u => new EntradaEstoqueDTO
            {
                EstoqueId = u.EstoqueId,
                ProdutoId = u.ProdutoId,
                Produto = u.Produto?.NomeProduto ?? string.Empty,
                Tamanho = u.Tamanho,
                QuantidadeEntrada = u.QuantidadeEntrada,
                DataEntrada = u.DataEntrada
            }).ToList();
        }

        public async Task<EntradaEstoqueDTO> GetById(int id)
        {
            var entradaEstoque = await _repository.GetByIdAsync(id);
            if (entradaEstoque == null)
                throw new Exception("Entrada de estoque não encontrada.");

            return new EntradaEstoqueDTO
            {
                EstoqueId = entradaEstoque.EstoqueId,
                ProdutoId = entradaEstoque.ProdutoId,
                Produto = entradaEstoque.Produto?.NomeProduto ?? string.Empty,
                Tamanho = entradaEstoque.Tamanho,
                QuantidadeEntrada = entradaEstoque.QuantidadeEntrada,
                DataEntrada = entradaEstoque.DataEntrada
            };
        }
    }
}
