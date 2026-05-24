using PepperImportsAPI.Domain.Entities;

namespace PepperImportsAPI.Application.Interfaces
{
    public interface IDespesaRepository
    {
        Task AddAsync(Despesa despesa);
        Task UpdateAsync(Despesa despesa);
        Task DeleteAsync(int id);
        Task<List<Despesa>> GetAllAsync();
        Task<Despesa> GetByIdAsync(int id);
        Task<Despesa?> GetByNomeAsync(string nome);
        Task<List<Despesa>> GetByIdsAsync(List<int> ids);
    }
}
