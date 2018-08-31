using JsonApiDotNetCore.Models;

namespace SIL.XForge.Models
{
    public abstract class ResourceBase : Identifiable<string>, IResource
    {
    }
}
