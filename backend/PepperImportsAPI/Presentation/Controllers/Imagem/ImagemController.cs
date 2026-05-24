using Microsoft.AspNetCore.Mvc;
using PepperImportsAPI.Application.DTOs.Imagem;
using PepperImportsAPI.Application.Interfaces.Imagem;

namespace PepperImportsAPI.Presentation.Controllers.Imagem
{
    [ApiController]
    [Route("api/imagem")]
    public class ImagemController : ControllerBase
    {
        private readonly IImagemRepository _imagemService;
        public ImagemController(IImagemRepository imageService)
        {
            _imagemService = imageService;
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Upload(IFormFile file, CancellationToken cancellationToken)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Nenhuma imagem enviada.");
            try
            {
                var imagemUrl = await _imagemService.SaveImageAsync(file, cancellationToken);

                return Ok(new ImagemDTO
                {
                    ImagemUrl = imagemUrl
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Falha ao processar upload.");
            }
        }
    }
}
