using PepperImportsAPI.Domain.Entities;

namespace PepperImportsAPI.Application.DTOs.Produto
{
    public class ProdutoEstoqueDTO
    {
        public Tamanho Tamanho { get; set; }
        public int Quantidade { get; set; }
    }
}
