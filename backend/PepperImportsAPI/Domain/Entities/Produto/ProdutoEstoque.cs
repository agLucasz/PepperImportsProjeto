namespace PepperImportsAPI.Domain.Entities
{
    public class ProdutoEstoque
    {
        public int ProdutoEstoqueId { get; set; }
        public int ProdutoId { get; set; }
        public Produto Produto { get; set; } = null!;
        public Tamanho Tamanho { get; set; }
        public int Quantidade { get; set; }
    }
}
