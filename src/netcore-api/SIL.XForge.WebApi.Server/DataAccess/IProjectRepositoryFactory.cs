using SIL.XForge.WebApi.Server.Models;

namespace SIL.XForge.WebApi.Server.DataAccess
{
    public interface IProjectRepositoryFactory<T> where T : IEntity
    {
        IRepository<T> Create(string projectCode);
    }
}
