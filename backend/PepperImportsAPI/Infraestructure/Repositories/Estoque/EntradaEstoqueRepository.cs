using Microsoft.EntityFrameworkCore;
using PepperImportsAPI.Application.Interfaces.Estoque;
using PepperImportsAPI.Domain.Entities;
using PepperImportsAPI.Infraestructure.Data;

namespace PepperImportsAPI.Infraestructure.Repositories
{
    public class EntradaEstoqueRepository : IEntradaEstoqueRepository
    {
        private readonly AppDbContext _context;
        public EntradaEstoqueRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task AddAsync(EntradaEstoque entradaEstoque)
        {
            _context.EntradasEstoque.Add(entradaEstoque);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entradaEstoque = await _context.EntradasEstoque.FindAsync(id);
            if (entradaEstoque != null)
            {
                _context.EntradasEstoque.Remove(entradaEstoque);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<EntradaEstoque>> GetAllAsync()
        {
            return await _context.EntradasEstoque
                .Include(e => e.Produto)
                .OrderByDescending(e => e.DataEntrada)
                .ToListAsync();
        }

        public async Task<EntradaEstoque?> GetByIdAsync(int id)
        {
            return await _context.EntradasEstoque
                .Include(e => e.Produto)
                .FirstOrDefaultAsync(e => e.EstoqueId == id);
        }
    }
}
