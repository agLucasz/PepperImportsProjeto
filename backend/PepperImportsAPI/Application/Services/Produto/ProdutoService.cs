using Microsoft.AspNetCore.SignalR;
using PepperImportsAPI.Application.DTOs.Produto;
using PepperImportsAPI.Application.Interfaces;
using PepperImportsAPI.Domain.Entities;
using PepperImportsAPI.Hubs;

namespace PepperImportsAPI.Application.Services
{
    public class ProdutoService
    {
        private readonly IProdutoRepository _repository;
        private readonly ICategoriaRepository _categoriaRepository;
        private readonly IHubContext<ProdutoHub> _hub;

        public ProdutoService(
            IProdutoRepository repository,
            ICategoriaRepository categoriaRepository,
            IHubContext<ProdutoHub> hub)
        {
            _repository = repository;
            _categoriaRepository = categoriaRepository;
            _hub = hub;
        }

        public async Task Create(ProdutoCreateDTO dto)
        {
            if (dto.CategoriaIds == null || dto.CategoriaIds.Count == 0)
                throw new Exception("Informe ao menos uma categoria.");

            if (dto.Estoques == null || dto.Estoques.Count == 0)
                throw new Exception("Informe a distribuição de estoque por tamanho.");

            if (dto.Estoques.Any(e => e.Quantidade < 0))
                throw new Exception("A quantidade por tamanho não pode ser negativa.");

            var categorias = await _categoriaRepository.GetByIdsAsync(dto.CategoriaIds);
            if (categorias.Count != dto.CategoriaIds.Count)
                throw new Exception("Uma ou mais categorias não foram encontradas.");

            var produto = new Produto
            {
                NomeProduto = dto.NomeProduto,
                Descricao = dto.Descricao,
                ImagemUrls = dto.ImagemUrls,
                ValorCompra = dto.ValorCompra,
                ValorVenda = dto.ValorVenda,
                Categorias = categorias,
                Ativo = dto.Ativo,
                Destaque = dto.Destaque,
                Estoques = dto.Estoques
                    .Where(e => e.Quantidade > 0)
                    .Select(e => new ProdutoEstoque
                    {
                        Tamanho = e.Tamanho,
                        Quantidade = e.Quantidade
                    })
                    .ToList()
            };

            await _repository.AddAsync(produto);

            if (dto.Ativo)
                await NotificarCatalogoAtualizado();
        }

        public async Task Update(int id, ProdutoCreateDTO dto)
        {
            var produto = await _repository.GetByIdAsync(id);
            if (produto == null)
                throw new Exception("Produto não encontrado.");

            if (dto.CategoriaIds == null || dto.CategoriaIds.Count == 0)
                throw new Exception("Informe ao menos uma categoria.");

            if (dto.Estoques == null || dto.Estoques.Count == 0)
                throw new Exception("Informe a distribuição de estoque por tamanho.");

            if (dto.Estoques.Any(e => e.Quantidade < 0))
                throw new Exception("A quantidade por tamanho não pode ser negativa.");

            var categorias = await _categoriaRepository.GetByIdsAsync(dto.CategoriaIds);
            if (categorias.Count != dto.CategoriaIds.Count)
                throw new Exception("Uma ou mais categorias não foram encontradas.");

            produto.NomeProduto = dto.NomeProduto;
            produto.Descricao = dto.Descricao;
            produto.ImagemUrls = dto.ImagemUrls;
            produto.ValorCompra = dto.ValorCompra;
            produto.ValorVenda = dto.ValorVenda;
            produto.Categorias = categorias;
            produto.Ativo = dto.Ativo;
            produto.Destaque = dto.Destaque;

            await _repository.UpdateAsync(produto);

            // Substitui os estoques (apenas tamanhos com quantidade > 0)
            var novosEstoques = dto.Estoques
                .Where(e => e.Quantidade > 0)
                .Select(e => new ProdutoEstoque
                {
                    Tamanho = e.Tamanho,
                    Quantidade = e.Quantidade
                })
                .ToList();

            await _repository.ReplaceEstoquesAsync(id, novosEstoques);

            if (dto.Ativo)
                await NotificarCatalogoAtualizado();
        }

        public async Task Delete(int id)
        {
            var produto = await _repository.GetByIdAsync(id);
            if (produto == null)
                throw new Exception("Produto não encontrado.");

            await _repository.DeleteAsync(id);
        }

        public async Task<List<ProdutoDTO>> GetAll()
        {
            var produtos = await _repository.GetAllAsync();

            return produtos.Select(p => new ProdutoDTO
            {
                ProdutoId = p.ProdutoId,
                NomeProduto = p.NomeProduto,
                Descricao = p.Descricao,
                ImagemUrls = p.ImagemUrls,
                Estoques = p.Estoques.Select(e => new ProdutoEstoqueDTO
                {
                    Tamanho = e.Tamanho,
                    Quantidade = e.Quantidade
                }).ToList(),
                QuantidadeTotal = p.Estoques.Sum(e => e.Quantidade),
                ValorCompra = p.ValorCompra,
                ValorVenda = p.ValorVenda,
                CategoriaIds = p.Categorias.Select(c => c.CategoriaId).ToList(),
                Categorias = p.Categorias.Select(c => c.NomeCategoria).ToList(),
                Ativo = p.Ativo,
                Destaque = p.Destaque,
            }).ToList();
        }

        public async Task<ProdutoDTO> GetById(int id)
        {
            var produto = await _repository.GetByIdAsync(id);
            if (produto == null)
                throw new Exception("Produto não encontrado.");

            return new ProdutoDTO
            {
                ProdutoId = produto.ProdutoId,
                NomeProduto = produto.NomeProduto,
                Descricao = produto.Descricao,
                ImagemUrls = produto.ImagemUrls,
                Estoques = produto.Estoques.Select(e => new ProdutoEstoqueDTO
                {
                    Tamanho = e.Tamanho,
                    Quantidade = e.Quantidade
                }).ToList(),
                QuantidadeTotal = produto.Estoques.Sum(e => e.Quantidade),
                ValorCompra = produto.ValorCompra,
                ValorVenda = produto.ValorVenda,
                CategoriaIds = produto.Categorias.Select(c => c.CategoriaId).ToList(),
                Categorias = produto.Categorias.Select(c => c.NomeCategoria).ToList(),
                Ativo = produto.Ativo,
                Destaque = produto.Destaque
            };
        }

        private async Task NotificarCatalogoAtualizado()
        {
            var produtos = await _repository.GetAllAsync();

            var catalogo = produtos
                .Where(p => p.Ativo)
                .OrderBy(p => p.NomeProduto)
                .Select(p => new ProdutoCatalogoDTO
                {
                    ProdutoId = p.ProdutoId,
                    NomeProduto = p.NomeProduto,
                    Descricao = p.Descricao,
                    ValorVenda = p.ValorVenda,
                    Estoques = p.Estoques.Select(e => new ProdutoEstoqueDTO
                    {
                        Tamanho = e.Tamanho,
                        Quantidade = e.Quantidade
                    }).ToList(),
                    QuantidadeTotal = p.Estoques.Sum(e => e.Quantidade),
                    ImagemUrls = p.ImagemUrls,
                    CategoriaIds = p.Categorias.Select(c => c.CategoriaId).ToList(),
                    NomeCategorias = p.Categorias.Select(c => c.NomeCategoria).ToList()
                })
                .ToList();

            await _hub.Clients.Group("catalogo")
                .SendAsync("CatalogoAtualizado", catalogo);
        }
    }
}
