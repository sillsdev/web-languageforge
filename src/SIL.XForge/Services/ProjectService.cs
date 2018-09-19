using System;
using System.Linq.Expressions;
using System.Threading.Tasks;
using AutoMapper;
using JsonApiDotNetCore.Services;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;
using SIL.XForge.Utils;

namespace SIL.XForge.Services
{
    public class ProjectService<TResource, TEntity> : ResourceServiceBase<TResource, TEntity>
        where TResource : ProjectResource
        where TEntity : ProjectEntity
    {
        public ProjectService(IJsonApiContext jsonApiContext, IRepository<TEntity> entities, IMapper mapper,
            IUserAccessor userAccessor) : base(jsonApiContext, entities, mapper, userAccessor)
        {
        }

        protected override Task CheckCanCreateAsync(TResource resource)
        {
            return Task.CompletedTask;
        }

        protected override async Task CheckCanUpdateAsync(string id)
        {
            if (SystemRole == SystemRoles.User)
            {
                Attempt<TEntity> attempt = await Entities.TryGetAsync(id);
                if (attempt.TryResult(out TEntity project))
                {
                    if (!project.Users.ContainsKey(UserId))
                        throw ForbiddenException();
                }
                else
                {
                    throw NotFoundException();
                }
            }
        }

        protected override Task CheckCanDeleteAsync(string id)
        {
            return CheckCanUpdateAsync(id);
        }

        protected override Task<Expression<Func<TEntity, bool>>> GetRightFilterAsync()
        {
            Expression<Func<TEntity, bool>> filter = null;
            switch (SystemRole)
            {
                case SystemRoles.User:
                    filter = (TEntity p) => p.Users.ContainsKey(UserId);
                    break;
                case SystemRoles.SystemAdmin:
                    filter = (TEntity u) => true;
                    break;
            }
            return Task.FromResult(filter);
        }
    }
}
