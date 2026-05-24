using PepperImportsAPI.Application.DTOs.Auth;
using PepperImportsAPI.Application.Interfaces;

namespace PepperImportsAPI.Application.Services.Auth
{
    public class AuthService
    {
        private readonly IUsuarioRepository _repository;
        private readonly TokenService _tokenService;

        public AuthService(IUsuarioRepository repository, TokenService tokenService)
        {
            _repository = repository;
            _tokenService = tokenService;
        }

        public async Task<LoginDTO> Login(LoginRequestDTO dto)
        {
            var usuario = await _repository.GetByEmailAsync(dto.Email);
            if (usuario == null || !BCrypt.Net.BCrypt.Verify(dto.Senha, usuario.Senha))
                throw new Exception("Credenciais inválidas.");

            var token = _tokenService.GenerateToken(usuario);

            return new LoginDTO
            {
                UsuarioId = usuario.UsuarioId,
                Nome = usuario.Nome,
                Email = usuario.Email,
                Token = token
            };
        }
    }
}
