using Microsoft.EntityFrameworkCore;
using PepperImportsAPI.Domain.Entities;

namespace PepperImportsAPI.Infraestructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Categoria> Categorias { get; set; }
        public DbSet<Produto> Produtos { get; set; }
        public DbSet<ProdutoEstoque> ProdutoEstoques { get; set; }
        public DbSet<Venda> Vendas { get; set; }
        public DbSet<VendaItem> VendaItens { get; set; }
        public DbSet<EntradaEstoque> EntradasEstoque { get; set; }
        public DbSet<Despesa> Despesas { get; set; }
        public DbSet<ContaAPagar> ContasAPagar { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ProdutoEstoque: cascade delete quando Produto for removido
            modelBuilder.Entity<ProdutoEstoque>()
                .HasOne(e => e.Produto)
                .WithMany(p => p.Estoques)
                .HasForeignKey(e => e.ProdutoId)
                .OnDelete(DeleteBehavior.Cascade);

            // Ignora a propriedade calculada QuantidadeTotal
            modelBuilder.Entity<Produto>()
                .Ignore(p => p.QuantidadeTotal);

            // Many-to-many: Produto <-> Categoria via tabela de junção ProdutoCategorias
            modelBuilder.Entity<Produto>()
                .HasMany(p => p.Categorias)
                .WithMany(c => c.Produtos)
                .UsingEntity(j => j.ToTable("ProdutoCategorias"));
        }
    }
}
