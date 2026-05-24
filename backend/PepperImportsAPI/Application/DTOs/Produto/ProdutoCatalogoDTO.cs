namespace PepperImportsAPI.Application.DTOs.Produto
{
    public class ProdutoCatalogoDTO
    {
        public int ProdutoId { get; set; }
        public string NomeProduto { get; set; }
        public string? Descricao { get; set; }
        public decimal ValorVenda { get; set; }
        public List<ProdutoEstoqueDTO> Estoques { get; set; } = new();
        public int QuantidadeTotal { get; set; }
        public List<string> ImagemUrls { get; set; } = new();
        public List<int> CategoriaIds { get; set; } = new();
        public List<string> NomeCategorias { get; set; } = new();
    }
}
