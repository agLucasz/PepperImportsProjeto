using Microsoft.EntityFrameworkCore;
using PepperImportsAPI.Application.Interfaces;
using PepperImportsAPI.Domain.Entities;
using PepperImportsAPI.Infraestructure.Data;

namespace PepperImportsAPI.Infraestructure.Repositories
{
    public class ProdutoRepository : IProdutoRepository
    {
        private readonly AppDbContext _context;

        public ProdutoRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Produto produto)
        {
            await _context.Produtos.AddAsync(produto);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Produto produto)
        {
            _context.Produtos.Update(produto);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var produto = await GetByIdAsync(id);
            if (produto != null)
            {
                _context.Produtos.Remove(produto);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<Produto>> GetAllAsync()
        {
            return await _context.Produtos
                .Include(p => p.Categorias)
                .Include(p => p.Estoques)
                .ToListAsync();
        }

        public async Task<Produto> GetByIdAsync(int id)
        {
            return await _context.Produtos
                .Include(p => p.Categorias)
                .Include(p => p.Estoques)
                .FirstOrDefaultAsync(p => p.ProdutoId == id);
        }

        public async Task ReplaceEstoquesAsync(int produtoId, List<ProdutoEstoque> estoques)
        {
            var existing = await _context.ProdutoEstoques
                .Where(e => e.ProdutoId == produtoId)
                .ToListAsync();

            _context.ProdutoEstoques.RemoveRange(existing);

            foreach (var e in estoques)
            {
                e.ProdutoId = produtoId;
                await _context.ProdutoEstoques.AddAsync(e);
            }

            await _context.SaveChangesAsync();
        }
    }
}
