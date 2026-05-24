namespace PepperImportsAPI.Domain.Entities
{
    public class Venda
    {
        public int VendaId { get; set; }
        public List<VendaItem> Itens { get; set; } = new List<VendaItem>();
        public decimal? ValorVenda { get; set; }
        public DateTime? DataVenda { get; set; }
    }
}
