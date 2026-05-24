using System.ComponentModel.DataAnnotations;

namespace PepperImportsAPI.Application.DTOs.ContaAPagar
{
    public class ContaAPagarCreateDTO
    {
        [Required]
        public int DespesaId { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Total de parcelas deve ser maior que zero.")]
        public int TotalParcelas { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Valor da parcela deve ser maior que zero.")]
        public decimal ValorParcela { get; set; }

        [Required]
        public DateTime DataPrimeiroVencimento { get; set; }
    }
}
