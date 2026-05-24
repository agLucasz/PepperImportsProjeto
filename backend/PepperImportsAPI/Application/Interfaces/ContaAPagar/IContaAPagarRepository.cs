using PepperImportsAPI.Domain.Entities;

namespace PepperImportsAPI.Application.Interfaces
{
    public interface IContaAPagarRepository
    {
        Task AddRangeAsync(List<ContaAPagar> contas);
        Task UpdateAsync(ContaAPagar conta);
        Task DeleteAsync(int id);
        Task DeleteByContaIdAsync(int contaId);
        Task<List<ContaAPagar>> GetAllAsync();
        Task<ContaAPagar> GetByIdAsync(int id);
        Task<List<ContaAPagar>> GetByContaIdAsync(int contaId);
        Task<int> GetNextContaIdAsync();
    }
}
