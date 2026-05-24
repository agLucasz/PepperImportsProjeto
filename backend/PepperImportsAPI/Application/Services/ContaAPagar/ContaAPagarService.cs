using PepperImportsAPI.Application.DTOs.ContaAPagar;
using PepperImportsAPI.Application.Interfaces;
using PepperImportsAPI.Domain.Entities;

namespace PepperImportsAPI.Application.Services
{
    public class ContaAPagarService
    {
        private readonly IContaAPagarRepository _repository;
        private readonly IDespesaRepository _despesaRepository;

        public ContaAPagarService(IContaAPagarRepository repository, IDespesaRepository despesaRepository)
        {
            _repository = repository;
            _despesaRepository = despesaRepository;
        }

        public async Task Create(ContaAPagarCreateDTO dto)
        {
            var despesa = await _despesaRepository.GetByIdAsync(dto.DespesaId);
            if (despesa == null)
                throw new Exception("Despesa não encontrada.");

            var contaId = await _repository.GetNextContaIdAsync();
            var valorTotal = dto.TotalParcelas * dto.ValorParcela;
            var dataAbertura = DateTime.UtcNow;

            var parcelas = new List<ContaAPagar>();

            for (int i = 0; i < dto.TotalParcelas; i++)
            {
                parcelas.Add(new ContaAPagar
                {
                    ContaId = contaId,
                    DespesaId = dto.DespesaId,
                    NumeroParcela = i + 1,
                    TotalParcelas = dto.TotalParcelas,
                    ValorParcela = dto.ValorParcela,
                    ValorTotal = valorTotal,
                    DataVencimento = dto.DataPrimeiroVencimento.AddDays(30 * i),
                    DataAbertura = dataAbertura,
                    Pago = false
                });
            }

            await _repository.AddRangeAsync(parcelas);
        }

        public async Task Update(int id, ContaAPagarUpdateDTO dto)
        {
            var conta = await _repository.GetByIdAsync(id);
            if (conta == null)
                throw new Exception("Conta a pagar não encontrada.");

            if (dto.ValorParcela.HasValue)
                conta.ValorParcela = dto.ValorParcela.Value;

            if (dto.DataVencimento.HasValue)
                conta.DataVencimento = dto.DataVencimento.Value;

            await _repository.UpdateAsync(conta);
        }

        public async Task BaixaParcela(int id)
        {
            var conta = await _repository.GetByIdAsync(id);
            if (conta == null)
                throw new Exception("Conta a pagar não encontrada.");

            if (conta.Pago)
                throw new Exception("Parcela já foi baixada.");

            conta.Pago = true;
            conta.DataPagamento = DateTime.UtcNow;

            await _repository.UpdateAsync(conta);
        }

        public async Task BaixaConta(int contaId)
        {
            var parcelas = await _repository.GetByContaIdAsync(contaId);
            if (!parcelas.Any())
                throw new Exception("Conta não encontrada.");

            var dataPagamento = DateTime.UtcNow;

            foreach (var parcela in parcelas.Where(p => !p.Pago))
            {
                parcela.Pago = true;
                parcela.DataPagamento = dataPagamento;
                await _repository.UpdateAsync(parcela);
            }
        }

        public async Task Delete(int id)
        {
            var conta = await _repository.GetByIdAsync(id);
            if (conta == null)
                throw new Exception("Conta a pagar não encontrada.");

            await _repository.DeleteAsync(id);
        }

        public async Task DeleteConta(int contaId)
        {
            var parcelas = await _repository.GetByContaIdAsync(contaId);
            if (!parcelas.Any())
                throw new Exception("Conta não encontrada.");

            await _repository.DeleteByContaIdAsync(contaId);
        }

        public async Task<List<ContaAPagarDTO>> GetAll()
        {
            var contas = await _repository.GetAllAsync();
            return contas.Select(MapToDTO).ToList();
        }

        public async Task<ContaAPagarDTO> GetById(int id)
        {
            var conta = await _repository.GetByIdAsync(id);
            if (conta == null)
                throw new Exception("Conta a pagar não encontrada.");

            return MapToDTO(conta);
        }

        public async Task<List<ContaAPagarDTO>> GetByContaId(int contaId)
        {
            var parcelas = await _repository.GetByContaIdAsync(contaId);
            if (!parcelas.Any())
                throw new Exception("Conta não encontrada.");

            return parcelas.Select(MapToDTO).ToList();
        }

        private static ContaAPagarDTO MapToDTO(ContaAPagar conta)
        {
            return new ContaAPagarDTO
            {
                ContaAPagarId = conta.ContaAPagarId,
                ContaId = conta.ContaId,
                DespesaId = conta.DespesaId,
                NomeDespesa = conta.Despesa?.NomeDespesa,
                NumeroParcela = conta.NumeroParcela,
                TotalParcelas = conta.TotalParcelas,
                ValorParcela = conta.ValorParcela,
                ValorTotal = conta.ValorTotal,
                DataVencimento = conta.DataVencimento,
                DataAbertura = conta.DataAbertura,
                DataPagamento = conta.DataPagamento,
                Pago = conta.Pago
            };
        }
    }
}
