using Microsoft.AspNetCore.Mvc;
using PepperImportsAPI.Application.DTOs.Video;
using PepperImportsAPI.Application.Interfaces.Video;

namespace PepperImportsAPI.Presentation.Controllers.Video
{
    [ApiController]
    [Route("api/video")]
    public class VideoController : ControllerBase
    {
        private readonly IVideoRepository _videoService;

        public VideoController(IVideoRepository videoService)
        {
            _videoService = videoService;
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(110 * 1024 * 1024)] // 110 MB (margem sobre o limite de 100 MB do service)
        [RequestFormLimits(MultipartBodyLengthLimit = 110 * 1024 * 1024)]
        public async Task<IActionResult> Upload(IFormFile file, CancellationToken cancellationToken)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Nenhum vídeo enviado.");

            try
            {
                var videoUrl = await _videoService.SaveVideoAsync(file, cancellationToken);

                return Ok(new VideoDTO { VideoUrl = videoUrl });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Falha ao processar upload do vídeo.");
            }
        }
    }
}
