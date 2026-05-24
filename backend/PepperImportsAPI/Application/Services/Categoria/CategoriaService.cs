using PepperImportsAPI.Application.DTOs.Categoria;
using PepperImportsAPI.Application.Interfaces;
using PepperImportsAPI.Domain.Entities;

namespace PepperImportsAPI.Application.Services
{
    public class CategoriaService
    {
        private readonly ICategoriaRepository _repository;
        public CategoriaService(ICategoriaRepository repository)
        {
            _repository = repository;
        }

        public async Task Create(CategoriaCreateDTO dto)
        {
            var categoriaExiste = await _repository.GetByNomeAsync(dto.NomeCategoria);
            if (categoriaExiste != null)
                throw new Exception("Categoria já existe!");

            var categoria = new Categoria
            {
                NomeCategoria = dto.NomeCategoria
            };

            await _repository.AddAsync(categoria);
        }

        public async Task Update(int id, CategoriaCreateDTO dto)
        {
            var categoria = await _repository.GetByIdAsync(id);
            if (categoria == null)
                throw new Exception("Categoria não encontrada.");

            var categoriaExiste = await _repository.GetByNomeAsync(dto.NomeCategoria);
            if (categoriaExiste != null)
                throw new Exception("Categoria já existe!");

            categoria.NomeCategoria = dto.NomeCategoria;
            await _repository.UpdateAsync(categoria);
        }

        public async Task Delete(int id)
        {
            var categoria = await _repository.GetByIdAsync(id);
            if (categoria == null)
            {
                throw new Exception("Categoria não encontrada.");
            }
            await _repository.DeleteAsync(id);
        }

        public async Task<List<CategoriaDTO>> GetAll()
        {
            var categorias = await _repository.GetAllAsync();

            return categorias.Select(c => new CategoriaDTO
            {
                CategoriaId = c.CategoriaId,
                NomeCategoria = c.NomeCategoria
            }).ToList();
        }

        public async Task<CategoriaDTO> GetById(int id)
        {
            var categoria = await _repository.GetByIdAsync(id);
            if (categoria == null)
            {
                throw new Exception("Categoria não encontrada.");
            }
            return new CategoriaDTO
            {
                CategoriaId = categoria.CategoriaId,
                NomeCategoria = categoria.NomeCategoria
            };
        }

        public async Task<CategoriaDTO> GetByNome(string nome)
        {
            var categoria = await _repository.GetByNomeAsync(nome);
            if (categoria == null)
            {
                throw new Exception("Categoria não encontrada.");
            }
            return new CategoriaDTO
            {
                CategoriaId = categoria.CategoriaId,
                NomeCategoria = categoria.NomeCategoria
            };

        }
    }
}
