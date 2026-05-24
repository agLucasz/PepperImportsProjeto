using System.ComponentModel.DataAnnotations;

namespace PepperImportsAPI.Application.DTOs.Venda
{
    public class VendaCreateDTO
    {
        [Required]
        public List<VendaItemCreateDTO> Itens { get; set; } = new();
    }
}
