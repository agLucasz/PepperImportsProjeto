using PepperImportsAPI.Domain.Entities;

namespace PepperImportsAPI.Application.Interfaces
{
    public interface IVendaRepository
    {
        Task AddAsync(Venda venda);
        Task UpdateAsync(Venda venda);
        Task<List<Venda>> GetAllAsync();
        Task<Venda?> GetByIdAsync(int id);
        Task AddItemAsync(VendaItem item);
    }
}
