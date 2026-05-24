using System.ComponentModel.DataAnnotations;

namespace PepperImportsAPI.Application.DTOs.Despesa
{
    public class DespesaCreateDTO
    {
        [Required]
        public string NomeDespesa { get; set; }
    }
}
