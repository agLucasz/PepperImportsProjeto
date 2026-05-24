using Microsoft.EntityFrameworkCore;
using PepperImportsAPI.Application.Interfaces;
using PepperImportsAPI.Domain.Entities;
using PepperImportsAPI.Infraestructure.Data;

namespace PepperImportsAPI.Infraestructure.Repositories
{
    public class DespesaRepository : IDespesaRepository
    {
        private readonly AppDbContext _context;
        public DespesaRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Despesa despesa)
        {
            await _context.Despesas.AddAsync(despesa);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Despesa despesa)
        {

            _context.Despesas.Update(despesa);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var despesa = await GetByIdAsync(id);
            if (despesa != null)
            {
                _context.Despesas.Remove(despesa);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<Despesa>> GetAllAsync()
        {
            return await _context.Despesas.ToListAsync();
        }

        public async Task<Despesa> GetByIdAsync(int id)
        {
            return await _context.Despesas.FindAsync(id);
        }

        public async Task<Despesa?> GetByNomeAsync(string nome)
        {
            return await _context.Despesas.FirstOrDefaultAsync(d => d.NomeDespesa == nome);
        }

        public async Task<List<Despesa>> GetByIdsAsync(List<int> ids)
        {
            return await _context.Despesas.Where(d => ids.Contains(d.DespesaId)).ToListAsync();
        }
    }
}
