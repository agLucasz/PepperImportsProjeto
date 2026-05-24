using PepperImportsAPI.Domain.Entities;

namespace PepperImportsAPI.Application.DTOs.Venda
{
    public class VendaItemDTO
    {
        public int VendaItemId { get; set; }
        public int ProdutoId { get; set; }
        public string NomeProduto { get; set; } = string.Empty;
        public Tamanho Tamanho { get; set; }
        public int QuantidadeItem { get; set; }
        public decimal? ValorItem { get; set; }
    }
}
