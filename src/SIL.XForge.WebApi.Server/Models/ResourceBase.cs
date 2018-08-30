using JsonApiDotNetCore.Models;

namespace SIL.XForge.WebApi.Server.Models
{
    public abstract class ResourceBase : Identifiable<string>, IResource
    {
    }
}
