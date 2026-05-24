using System.ComponentModel.DataAnnotations;

namespace PepperImportsAPI.Application.DTOs.Usuario
{
    public class UsuarioCreateDTO
    {
        [Required]
        public string Nome { get; set; }

        [Required]
        public string Email { get; set; }

        [Required]
        public string Senha { get; set; }
    }
}
