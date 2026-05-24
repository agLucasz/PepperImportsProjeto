namespace PepperImportsAPI.Application.DTOs.Venda
{
    public class VendaDTO
    {
        public int VendaId { get; set; }
        public List<VendaItemDTO> Itens { get; set; } = new();
        public decimal ValorVenda { get; set; }
        public DateTime? DataVenda { get; set; }

    }
}
