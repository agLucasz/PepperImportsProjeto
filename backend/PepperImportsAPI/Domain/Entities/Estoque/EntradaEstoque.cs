using System.ComponentModel.DataAnnotations;

namespace PepperImportsAPI.Domain.Entities
{
    public class EntradaEstoque
    {
        [Key]
        public int EstoqueId { get; set; }
        public int ProdutoId { get; set; }
        public Produto Produto { get; set; }

        /// <summary>Tamanho que recebeu a entrada.</summary>
        public Tamanho Tamanho { get; set; }

        public int QuantidadeEntrada { get; set; }
        public DateTime DataEntrada { get; set; }
    }
}
