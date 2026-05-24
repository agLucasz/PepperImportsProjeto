using PepperImportsAPI.Domain.Entities;

namespace PepperImportsAPI.Application.Interfaces
{
    public interface ICategoriaRepository
    {
        Task AddAsync(Categoria categoria);
        Task UpdateAsync(Categoria categoria);
        Task DeleteAsync(int id);
        Task<List<Categoria>> GetAllAsync();
        Task<Categoria> GetByIdAsync(int id);
        Task<Categoria?> GetByNomeAsync(string nome);
        Task<List<Categoria>> GetByIdsAsync(List<int> ids);
    }
}
