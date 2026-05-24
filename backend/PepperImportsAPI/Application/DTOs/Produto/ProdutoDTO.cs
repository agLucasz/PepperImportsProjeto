namespace PepperImportsAPI.Application.DTOs.Produto
{
    public class ProdutoDTO
    {
        public int ProdutoId { get; set; }
        public string NomeProduto { get; set; }
        public string? Descricao { get; set; }
        public List<string> ImagemUrls { get; set; } = new();

        /// <summary>Distribuição de estoque por tamanho.</summary>
        public List<ProdutoEstoqueDTO> Estoques { get; set; } = new();

        /// <summary>Soma das quantidades de todos os tamanhos.</summary>
        public int QuantidadeTotal { get; set; }

        public decimal ValorCompra { get; set; }
        public decimal ValorVenda { get; set; }
        public List<int> CategoriaIds { get; set; } = new();
        public List<string> Categorias { get; set; } = new();
        public bool Ativo { get; set; }
        public bool Destaque { get; set; }
    }
}
