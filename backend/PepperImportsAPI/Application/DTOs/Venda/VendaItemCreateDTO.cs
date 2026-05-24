using PepperImportsAPI.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace PepperImportsAPI.Application.DTOs.Venda
{
    public class VendaItemCreateDTO
    {
        [Required]
        public int ProdutoId { get; set; }

        [Required]
        public Tamanho Tamanho { get; set; }

        [Required]
        public int QuantidadeItem { get; set; }

        public decimal? ValorItem { get; set; }
    }
}
