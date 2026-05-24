using PepperImportsAPI.Domain.Entities;

namespace PepperImportsAPI.Application.Interfaces.Estoque
{
    public interface IEntradaEstoqueRepository
    {
        Task AddAsync(EntradaEstoque entradaEstoque);
        Task DeleteAsync(int id);
        Task<List<EntradaEstoque>> GetAllAsync();
        Task<EntradaEstoque> GetByIdAsync(int id);
    }
}
