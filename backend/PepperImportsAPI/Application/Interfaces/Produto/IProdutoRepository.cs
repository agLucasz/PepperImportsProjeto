using PepperImportsAPI.Domain.Entities;

namespace PepperImportsAPI.Application.Interfaces
{
    public interface IProdutoRepository
    {
        Task AddAsync(Produto produto);
        Task UpdateAsync(Produto produto);
        Task DeleteAsync(int id);
        Task<List<Produto>> GetAllAsync();
        Task<Produto> GetByIdAsync(int id);

        /// <summary>Remove todos os estoques do produto e insere os novos.</summary>
        Task ReplaceEstoquesAsync(int produtoId, List<ProdutoEstoque> estoques);
    }
}
