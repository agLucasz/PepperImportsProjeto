using PepperImportsAPI.Domain.Entities;

namespace PepperImportsAPI.Application.Interfaces
{
    public interface IUsuarioRepository
    {
        Task AddAsync(Usuario usuario);
        Task UpdateAsync(Usuario usuario);
        Task DeleteAsync(int id);
        Task<List<Usuario>> GetAllAsync();
        Task<Usuario> GetByIdAsync(int id);
        Task<Usuario?> GetByEmailAsync(string email);
    }
}
