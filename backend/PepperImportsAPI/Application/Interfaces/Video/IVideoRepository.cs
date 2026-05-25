namespace PepperImportsAPI.Application.Interfaces.Video
{
    public interface IVideoRepository
    {
        Task<string> SaveVideoAsync(IFormFile video, CancellationToken cancellationToken = default);
    }
}
