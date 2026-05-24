using System.ComponentModel.DataAnnotations;

namespace PepperImportsAPI.Application.DTOs.Produto
{
    public class ProdutoCreateDTO
    {
        [Required]
        public string NomeProduto { get; set; }

        public string? Descricao { get; set; }

        [Required]
        public List<string> ImagemUrls { get; set; } = new();

        /// <summary>Distribuição de estoque por tamanho.</summary>
        [Required]
        public List<ProdutoEstoqueDTO> Estoques { get; set; } = new();

        [Required]
        public decimal ValorCompra { get; set; }

        [Required]
        public decimal ValorVenda { get; set; }

        [Required]
        public List<int> CategoriaIds { get; set; } = new();

        public bool Ativo { get; set; } = true;
        public bool Destaque { get; set; } = false;
    }
}
