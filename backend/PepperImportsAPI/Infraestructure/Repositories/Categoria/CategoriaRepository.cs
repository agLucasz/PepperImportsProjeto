using Microsoft.EntityFrameworkCore;
using PepperImportsAPI.Application.Interfaces;
using PepperImportsAPI.Domain.Entities;
using PepperImportsAPI.Infraestructure.Data;

namespace PepperImportsAPI.Infraestructure.Repositories
{
    public class CategoriaRepository : ICategoriaRepository
    {
        private readonly AppDbContext _context;
        public CategoriaRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Categoria categoria)
        {
            await _context.Categorias.AddAsync(categoria);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Categoria categoria)
        {

            _context.Categorias.Update(categoria);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var categoria = await GetByIdAsync(id);
            if (categoria != null)
            {
                _context.Categorias.Remove(categoria);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<Categoria>> GetAllAsync()
        {
            return await _context.Categorias.ToListAsync();
        }

        public async Task<Categoria> GetByIdAsync(int id)
        {
            return await _context.Categorias.FindAsync(id);
        }

        public async Task<Categoria?> GetByNomeAsync(string nome)
        {
            return await _context.Categorias.FirstOrDefaultAsync(c => c.NomeCategoria == nome);
        }

        public async Task<List<Categoria>> GetByIdsAsync(List<int> ids)
        {
            return await _context.Categorias.Where(c => ids.Contains(c.CategoriaId)).ToListAsync();
        }
    }
}
