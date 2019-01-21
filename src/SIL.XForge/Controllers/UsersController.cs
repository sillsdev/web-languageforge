using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SIL.XForge.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Controllers
{
    public abstract class UsersController<T> : JsonApiControllerBase<T> where T : UserResource
    {
        private readonly IUserService<T> _userService;

        protected UsersController(IJsonApiContext jsonApiContext, IUserService<T> userService,
            ILoggerFactory loggerFactory) : base(jsonApiContext, userService, loggerFactory)
        {
            _userService = userService;
        }

        [HttpPost("{id}/avatar")]
        [RequestSizeLimit(100_000_000)]
        public async Task<IActionResult> UploadAvatarAsync(string id, [FromForm] IFormFile file)
        {
            using (Stream stream = file.OpenReadStream())
            {
                Uri uri = await _userService.SaveAvatarAsync(id, file.FileName, stream);
                return Created(uri.PathAndQuery, Path.GetFileName(uri.AbsolutePath));
            }
        }
    }
}
