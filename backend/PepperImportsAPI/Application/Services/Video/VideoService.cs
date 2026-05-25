using PepperImportsAPI.Application.Interfaces.Video;

namespace PepperImportsAPI.Application.Services.Video
{
    public class VideoService : IVideoRepository
    {
        private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".mp4",
            ".webm",
            ".mov",
        };

        private const long MaxFileSizeInBytes = 100 * 1024 * 1024; // 100 MB

        private readonly IWebHostEnvironment _environment;

        public VideoService(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        public async Task<string> SaveVideoAsync(IFormFile video, CancellationToken cancellationToken = default)
        {
            if (video == null || video.Length == 0)
                throw new InvalidOperationException("Nenhum vídeo enviado.");

            var extension = Path.GetExtension(video.FileName);

            if (string.IsNullOrWhiteSpace(extension) || !AllowedExtensions.Contains(extension))
                throw new InvalidOperationException("Formato inválido. Use MP4, WEBM ou MOV.");

            if (video.Length > MaxFileSizeInBytes)
                throw new InvalidOperationException("Vídeo muito grande. Limite de 100 MB.");

            var webRootPath = string.IsNullOrWhiteSpace(_environment.WebRootPath)
                ? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot")
                : _environment.WebRootPath;

            var uploadsDirectory = Path.Combine(webRootPath, "uploads");
            Directory.CreateDirectory(uploadsDirectory);

            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsDirectory, fileName);

            await using var stream = new FileStream(filePath, FileMode.CreateNew);
            await video.CopyToAsync(stream, cancellationToken);

            return $"/uploads/{fileName}";
        }
    }
}
