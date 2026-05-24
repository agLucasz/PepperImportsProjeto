using PepperImportsAPI.Application.DTOs.Usuario;
using PepperImportsAPI.Application.Interfaces;
using PepperImportsAPI.Domain.Entities;
using System.Net;
using System.Text.RegularExpressions;

namespace PepperImportsAPI.Application.Services
{
        public class UsuarioService
        {
            private readonly IUsuarioRepository _repository;

            public UsuarioService(IUsuarioRepository repository)
            {
                _repository = repository;
            }

            public async Task Create(UsuarioCreateDTO dto)
            {
                await ValidarEmail(dto.Email);
                ValidarSenha(dto.Senha);

                var emailExiste = await _repository.GetByEmailAsync(dto.Email);
                if (emailExiste != null)
                    throw new Exception("E-mail já cadastrado.");

                var usuario = new Usuario
                {
                    Nome = dto.Nome,
                    Email = dto.Email,
                    Senha = BCrypt.Net.BCrypt.HashPassword(dto.Senha),
                };
                await _repository.AddAsync(usuario);
            }

            public async Task Update(int id, UsuarioCreateDTO dto)
            {
                var usuario = await _repository.GetByIdAsync(id);
                if (usuario == null)
                    throw new Exception("Usuário não encontrado.");

                await ValidarEmail(dto.Email);
                ValidarSenha(dto.Senha);

                usuario.Nome = dto.Nome;
                usuario.Email = dto.Email;
                usuario.Senha = BCrypt.Net.BCrypt.HashPassword(dto.Senha);
                await _repository.UpdateAsync(usuario);
            }

            public async Task Delete(int id)
            {
                var usuario = await _repository.GetByIdAsync(id);
                if (usuario == null)
                {
                    throw new Exception("Usuário não encontrado.");
                }
                await _repository.DeleteAsync(id);
            }

            public async Task<List<UsuarioDTO>> GetAll()
            {
                var usuarios = await _repository.GetAllAsync();

                return usuarios.Select(u => new UsuarioDTO
                {
                    UsuarioId = u.UsuarioId,
                    Nome = u.Nome,
                    Email = u.Email,
                }).ToList();
            }

            public async Task<UsuarioDTO> GetById(int id)
            {
                var usuario = await _repository.GetByIdAsync(id);
                if (usuario == null)
                {
                    throw new Exception("Usuário não encontrado.");
                }
                return new UsuarioDTO
                {
                    UsuarioId = usuario.UsuarioId,
                    Nome = usuario.Nome,
                    Email = usuario.Email,
                };
            }

            public async Task<UsuarioDTO> GetByEmail(string email)
            {
                var usuario = await _repository.GetByEmailAsync(email);
                if (usuario == null)
                {
                    throw new Exception("Usuário não encontrado.");
                }
                return new UsuarioDTO
                {
                    UsuarioId = usuario.UsuarioId,
                    Nome = usuario.Nome,
                    Email = usuario.Email,
                };

            }
            private static void ValidarSenha(string senha)
            {
                if (!Regex.IsMatch(senha, @"[A-Z]"))
                    throw new Exception("A senha deve conter pelo menos uma letra maiúscula.");
                if (!Regex.IsMatch(senha, @"[a-z]"))
                    throw new Exception("A senha deve conter pelo menos uma letra minúscula.");
                if (!Regex.IsMatch(senha, @"[0-9]"))
                    throw new Exception("A senha deve conter pelo menos um número.");
                if (!Regex.IsMatch(senha, @"[^a-zA-Z0-9]"))
                    throw new Exception("A senha deve conter pelo menos um caractere especial.");
            }

            private static async Task ValidarEmail(string email)
            {
                if (!Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                    throw new Exception("Formato de e-mail inválido.");

                var dominio = email.Split('@')[1];
                try
                {
                    await Dns.GetHostEntryAsync(dominio);
                }
                catch
                {
                    throw new Exception($"O domínio '{dominio}' não existe.");
                }
            }
        }
    }

