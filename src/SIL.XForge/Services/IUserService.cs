using System;
using System.IO;
using System.Threading.Tasks;
using JsonApiDotNetCore.Services;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public interface IUserService<T> : IResourceService<T, string> where T : UserResource
    {
        Task<Uri> SaveAvatarAsync(string id, string name, Stream inputStream);
    }
}
