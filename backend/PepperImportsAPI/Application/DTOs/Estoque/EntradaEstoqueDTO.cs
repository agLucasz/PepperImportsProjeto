using PepperImportsAPI.Domain.Entities;

namespace PepperImportsAPI.Application.DTOs.Estoque
{
    public class EntradaEstoqueDTO
    {
        public int EstoqueId { get; set; }
        public int ProdutoId { get; set; }
        public string Produto { get; set; }
        public Tamanho Tamanho { get; set; }
        public int QuantidadeEntrada { get; set; }
        public DateTime DataEntrada { get; set; }
    }
}
