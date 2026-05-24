using PepperImportsAPI.Application.DTOs.Despesa;
using PepperImportsAPI.Application.Interfaces;
using PepperImportsAPI.Domain.Entities;

namespace PepperImportsAPI.Application.Services
{
    public class DespesaService
    {
        private readonly IDespesaRepository _repository;
        public DespesaService(IDespesaRepository repository)
        {
            _repository = repository;
        }

        public async Task Create(DespesaCreateDTO dto)
        {
            var despesaExiste = await _repository.GetByNomeAsync(dto.NomeDespesa);
            if (despesaExiste != null)
                throw new Exception("Despesa já existe!");
            var despesa = new Despesa
            {
                NomeDespesa = dto.NomeDespesa
            };

            await _repository.AddAsync(despesa);
        }

        public async Task Update(int id, DespesaCreateDTO dto)
        {
            var despesa = await _repository.GetByIdAsync(id);
            if (despesa == null)
                throw new Exception("Despesa não encontrada.");

            var despesaExiste = await _repository.GetByNomeAsync(dto.NomeDespesa);
            if (despesaExiste != null)
                throw new Exception("Despesa já existe!");
            despesa.NomeDespesa = dto.NomeDespesa;
            await _repository.UpdateAsync(despesa);
        }

        public async Task Delete(int id)
        {
            var despesa = await _repository.GetByIdAsync(id);
            if (despesa == null)
            {
                throw new Exception("Despesa não encontrada.");
            }
            await _repository.DeleteAsync(id);
        }

        public async Task<List<DespesaDTO>> GetAll()
        {
            var despesas = await _repository.GetAllAsync();

            return despesas.Select(d => new DespesaDTO
            {
                DespesaId = d.DespesaId,
                NomeDespesa = d.NomeDespesa
            }).ToList();
        }

        public async Task<DespesaDTO> GetById(int id)
        {
            var despesa = await _repository.GetByIdAsync(id);
            if (despesa == null)
            {
                throw new Exception("Despesa não encontrada.");
            }
            return new DespesaDTO
            {
                DespesaId = despesa.DespesaId,
                NomeDespesa = despesa.NomeDespesa
            };
        }

        public async Task<DespesaDTO> GetByNome(string nome)
        {
            var despesa = await _repository.GetByNomeAsync(nome);
            if (despesa == null)
            {
                throw new Exception("Despesa não encontrada.");
            }
            return new DespesaDTO 
            {
                DespesaId = despesa.DespesaId,
                NomeDespesa = despesa.NomeDespesa
            };

        }
    }
}
