using Microsoft.EntityFrameworkCore;
using PepperImportsAPI.Application.Interfaces;
using PepperImportsAPI.Domain.Entities;
using PepperImportsAPI.Infraestructure.Data;

namespace PepperImportsAPI.Infraestructure.Repositories
{
    public class ContaAPagarRepository : IContaAPagarRepository
    {
        private readonly AppDbContext _context;

        public ContaAPagarRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddRangeAsync(List<ContaAPagar> contas)
        {
            await _context.ContasAPagar.AddRangeAsync(contas);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(ContaAPagar conta)
        {
            _context.ContasAPagar.Update(conta);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var conta = await GetByIdAsync(id);
            if (conta != null)
            {
                _context.ContasAPagar.Remove(conta);
                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteByContaIdAsync(int contaId)
        {
            var parcelas = await _context.ContasAPagar
                .Where(c => c.ContaId == contaId)
                .ToListAsync();

            if (parcelas.Any())
            {
                _context.ContasAPagar.RemoveRange(parcelas);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<ContaAPagar>> GetAllAsync()
        {
            return await _context.ContasAPagar
                .Include(c => c.Despesa)
                .OrderBy(c => c.ContaId)
                .ThenBy(c => c.NumeroParcela)
                .ToListAsync();
        }

        public async Task<ContaAPagar> GetByIdAsync(int id)
        {
            return await _context.ContasAPagar
                .Include(c => c.Despesa)
                .FirstOrDefaultAsync(c => c.ContaAPagarId == id);
        }

        public async Task<List<ContaAPagar>> GetByContaIdAsync(int contaId)
        {
            return await _context.ContasAPagar
                .Include(c => c.Despesa)
                .Where(c => c.ContaId == contaId)
                .OrderBy(c => c.NumeroParcela)
                .ToListAsync();
        }

        public async Task<int> GetNextContaIdAsync()
        {
            var maxContaId = await _context.ContasAPagar
                .MaxAsync(c => (int?)c.ContaId) ?? 0;

            return maxContaId + 1;
        }
    }
}
