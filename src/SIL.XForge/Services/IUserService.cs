using System;
using System.IO;
using System.Threading.Tasks;
using JsonApiDotNetCore.Services;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public interface IUserService : IResourceService<UserResource, string>
    {
        Task<Uri> SaveAvatarAsync(string id, string name, Stream inputStream);
    }
}
