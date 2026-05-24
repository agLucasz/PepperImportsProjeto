namespace PepperImportsAPI.Domain.Entities
{
    public class VendaItem
    {
        public int VendaItemId { get; set; }
        public int VendaId { get; set; }
        public int ProdutoId { get; set; }
        public Produto Produto { get; set; } = null!;

        /// <summary>Tamanho vendido neste item.</summary>
        public Tamanho Tamanho { get; set; }

        public int QuantidadeItem { get; set; }
        public decimal? ValorItem { get; set; }
    }
}
