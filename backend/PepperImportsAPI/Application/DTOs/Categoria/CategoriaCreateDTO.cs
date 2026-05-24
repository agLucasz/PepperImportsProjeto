using System.ComponentModel.DataAnnotations;

namespace PepperImportsAPI.Application.DTOs.Categoria
{
    public class CategoriaCreateDTO
    {
        [Required]
        public string NomeCategoria { get; set; }
    }
}
