namespace PepperImportsAPI.Application.DTOs.ContaAPagar
{
    public class ContaAPagarDTO
    {
        public int ContaAPagarId { get; set; }
        public int ContaId { get; set; }
        public int DespesaId { get; set; }
        public string NomeDespesa { get; set; }
        public int NumeroParcela { get; set; }
        public int TotalParcelas { get; set; }
        public decimal ValorParcela { get; set; }
        public decimal ValorTotal { get; set; }
        public DateTime DataVencimento { get; set; }
        public DateTime DataAbertura { get; set; }
        public DateTime? DataPagamento { get; set; }
        public bool Pago { get; set; }
    }
}
