using PepperImportsAPI.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace PepperImportsAPI.Application.DTOs.Estoque
{
    public class EntradaEstoqueCreateDTO
    {
        [Required]
        public int ProdutoId { get; set; }

        [Required]
        public Tamanho Tamanho { get; set; }

        [Required]
        public int QuantidadeEntrada { get; set; }

        [Required]
        public DateTime DataEntrada { get; set; }
    }
}
