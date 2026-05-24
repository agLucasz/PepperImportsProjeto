namespace PepperImportsAPI.Application.DTOs.Auth
{
    public class LoginDTO
    {
        public int UsuarioId { get; set; }
        public string Token { get; set; }
        public string Nome { get; set; }
        public string Email { get; set; }
    }
}
