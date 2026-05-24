namespace PepperImportsAPI.Domain.Entities
{
    public class Produto
    {
        public int ProdutoId { get; set; }
        public string NomeProduto { get; set; }
        public string? Descricao { get; set; }
        public List<string> ImagemUrls { get; set; } = new List<string>();
        public decimal ValorCompra { get; set; }
        public decimal ValorVenda { get; set; }
        public ICollection<Categoria> Categorias { get; set; } = new List<Categoria>();
        public ICollection<ProdutoEstoque> Estoques { get; set; } = new List<ProdutoEstoque>();
        public bool Ativo { get; set; } = true;
        public bool Destaque { get; set; } = false;

        /// <summary>Soma das quantidades por tamanho.</summary>
        public int QuantidadeTotal => Estoques?.Sum(e => e.Quantidade) ?? 0;
    }

    public enum Tamanho
    {
        PP = 1,
        M  = 2,
        G  = 3,
        GG = 4,
        G1 = 5,
        G2 = 6
    }
}
