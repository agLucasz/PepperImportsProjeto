namespace PepperImportsAPI.Application.Interfaces.Imagem
{
    public interface IImagemRepository
    {
        Task<string> SaveImageAsync(IFormFile image, CancellationToken cancellationToken = default);
    }
}
