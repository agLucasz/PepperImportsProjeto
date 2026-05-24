namespace PepperImportsAPI.Domain.Entities
{
    public class Categoria
    {
        public int CategoriaId { get; set; }
        public string NomeCategoria { get; set; }

        // Navegação many-to-many
        public ICollection<Produto> Produtos { get; set; } = new List<Produto>();
    }
}
