using System.ComponentModel.DataAnnotations;

namespace PepperImportsAPI.Application.DTOs.Auth
{
    public class LoginRequestDTO
    {
        [Required]
        public string Email { get; set; }

        [Required]
        public string Senha { get; set; }  
    }
}
