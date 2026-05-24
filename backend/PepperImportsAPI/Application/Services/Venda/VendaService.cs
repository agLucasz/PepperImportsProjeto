using PepperImportsAPI.Application.DTOs.Venda;
using PepperImportsAPI.Application.Interfaces;
using PepperImportsAPI.Domain.Entities;

namespace PepperImportsAPI.Application.Services
{
    public class VendaService
    {
        private readonly IVendaRepository _repository;
        private readonly IProdutoRepository _produtoRepository;

        public VendaService(IVendaRepository repository, IProdutoRepository produtoRepository)
        {
            _repository = repository;
            _produtoRepository = produtoRepository;
        }

        public async Task Create(VendaCreateDTO dto)
        {
            if (dto.Itens == null || dto.Itens.Count == 0)
                throw new Exception("A venda deve ter ao menos um item.");

            var itens = new List<VendaItem>();
            foreach (var itemDto in dto.Itens)
            {
                var produto = await _produtoRepository.GetByIdAsync(itemDto.ProdutoId);
                if (produto == null)
                    throw new Exception($"Produto {itemDto.ProdutoId} não encontrado.");

                var estoque = produto.Estoques.FirstOrDefault(e => e.Tamanho == itemDto.Tamanho);
                if (estoque == null || estoque.Quantidade < itemDto.QuantidadeItem)
                    throw new Exception(
                        $"Estoque insuficiente para '{produto.NomeProduto}' no tamanho '{itemDto.Tamanho}'. " +
                        $"Disponível: {estoque?.Quantidade ?? 0}.");

                // Debita o estoque do tamanho correto
                estoque.Quantidade -= itemDto.QuantidadeItem;
                await _produtoRepository.UpdateAsync(produto);

                itens.Add(new VendaItem
                {
                    ProdutoId = itemDto.ProdutoId,
                    Tamanho = itemDto.Tamanho,
                    QuantidadeItem = itemDto.QuantidadeItem,
                    ValorItem = itemDto.ValorItem * itemDto.QuantidadeItem,
                });
            }

            var venda = new Venda
            {
                Itens = itens,
                ValorVenda = itens.Sum(i => i.ValorItem),
                DataVenda = DateTime.UtcNow
            };

            await _repository.AddAsync(venda);
        }

        public async Task AddItem(int vendaId, VendaItemCreateDTO dto)
        {
            var venda = await _repository.GetByIdAsync(vendaId);
            if (venda == null)
                throw new Exception("Venda não encontrada.");

            var produto = await _produtoRepository.GetByIdAsync(dto.ProdutoId);
            if (produto == null)
                throw new Exception("Produto não encontrado.");

            var estoque = produto.Estoques.FirstOrDefault(e => e.Tamanho == dto.Tamanho);
            if (estoque == null || estoque.Quantidade < dto.QuantidadeItem)
                throw new Exception(
                    $"Estoque insuficiente para '{produto.NomeProduto}' no tamanho '{dto.Tamanho}'. " +
                    $"Disponível: {estoque?.Quantidade ?? 0}.");

            // Debita o estoque do tamanho correto
            estoque.Quantidade -= dto.QuantidadeItem;
            await _produtoRepository.UpdateAsync(produto);

            var item = new VendaItem
            {
                VendaId = vendaId,
                ProdutoId = dto.ProdutoId,
                Tamanho = dto.Tamanho,
                QuantidadeItem = dto.QuantidadeItem,
                ValorItem = produto.ValorVenda * dto.QuantidadeItem,
            };

            await _repository.AddItemAsync(item);

            venda.ValorVenda = (venda.ValorVenda ?? 0) + item.ValorItem;
            await _repository.UpdateAsync(venda);
        }

        public async Task ReopenVenda(int id)
        {
            var venda = await _repository.GetByIdAsync(id);
            if (venda == null)
                throw new Exception("Venda não encontrada.");

            await _repository.UpdateAsync(venda);
        }

        public async Task Cancel(int id)
        {
            var venda = await _repository.GetByIdAsync(id);
            if (venda == null)
                throw new Exception("Venda não encontrada.");

            await _repository.UpdateAsync(venda);
        }

        public async Task<List<VendaDTO>> GetAll()
        {
            var vendas = await _repository.GetAllAsync();

            return vendas.Select(v => new VendaDTO
            {
                VendaId = v.VendaId,
                ValorVenda = v.ValorVenda ?? 0,
                DataVenda = v.DataVenda,
                Itens = v.Itens.Select(i => new VendaItemDTO
                {
                    VendaItemId = i.VendaItemId,
                    ProdutoId = i.ProdutoId,
                    NomeProduto = i.Produto?.NomeProduto ?? string.Empty,
                    Tamanho = i.Tamanho,
                    QuantidadeItem = i.QuantidadeItem,
                    ValorItem = i.ValorItem
                }).ToList()
            }).ToList();
        }

        public async Task<VendaDTO> GetById(int id)
        {
            var venda = await _repository.GetByIdAsync(id);
            if (venda == null)
                throw new Exception("Venda não encontrada.");

            return new VendaDTO
            {
                VendaId = venda.VendaId,
                ValorVenda = venda.ValorVenda ?? 0,
                DataVenda = venda.DataVenda,
                Itens = venda.Itens.Select(i => new VendaItemDTO
                {
                    VendaItemId = i.VendaItemId,
                    ProdutoId = i.ProdutoId,
                    NomeProduto = i.Produto?.NomeProduto ?? string.Empty,
                    Tamanho = i.Tamanho,
                    QuantidadeItem = i.QuantidadeItem,
                    ValorItem = i.ValorItem
                }).ToList()
            };
        }
    }
}
