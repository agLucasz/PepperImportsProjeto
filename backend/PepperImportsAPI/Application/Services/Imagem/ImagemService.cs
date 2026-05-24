using PepperImportsAPI.Application.Interfaces.Imagem;

namespace PepperImportsAPI.Application.Services.Imagem
{
    public class ImagemService : IImagemRepository
    {
        private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
        };

        private const long MaxFileSizeInBytes = 5 * 1024 * 1024;
        private readonly IWebHostEnvironment _environment;

        public ImagemService(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        public async Task<string> SaveImageAsync(IFormFile image, CancellationToken cancellationToken = default)
        {
            if (image == null || image.Length == 0)
                throw new InvalidOperationException("Nenhuma imagem enviada.");

            var extension = Path.GetExtension(image.FileName);

            if (string.IsNullOrWhiteSpace(extension) || !AllowedExtensions.Contains(extension))
                throw new InvalidOperationException("Formato de imagem inválido. Use JPG, JPEG, PNG ou WEBP.");

            if (image.Length > MaxFileSizeInBytes)
                throw new InvalidOperationException("Imagem muito grande. Limite de 5MB.");

            var webRootPath = string.IsNullOrWhiteSpace(_environment.WebRootPath)
                ? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot")
                : _environment.WebRootPath;

            var uploadsDirectory = Path.Combine(webRootPath, "uploads");
            Directory.CreateDirectory(uploadsDirectory);

            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsDirectory, fileName);

            await using var stream = new FileStream(filePath, FileMode.CreateNew);
            await image.CopyToAsync(stream, cancellationToken);

            return $"/uploads/{fileName}";
        }
    }
}
