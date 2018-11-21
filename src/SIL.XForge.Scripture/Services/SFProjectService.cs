using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using JsonApiDotNetCore.Internal.Query;
using JsonApiDotNetCore.Services;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;
using SIL.XForge.Scripture.Models;
using SIL.XForge.Services;
using SIL.XForge.Utils;

namespace SIL.XForge.Scripture.Services
{
    public class SFProjectService : RepositoryResourceServiceBase<SFProjectResource, SFProjectEntity>
    {
        public SFProjectService(IJsonApiContext jsonApiContext, IMapper mapper, IUserAccessor userAccessor,
            IRepository<SFProjectEntity> projects) : base(jsonApiContext, mapper, userAccessor, projects)
        {
        }

        public IResourceMapper<SyncJobResource, SyncJobEntity> SyncJobMapper { get; set; }
        public IResourceMapper<SFProjectUserResource, SFProjectUserEntity> ProjectUserMapper { get; set; }
        public IResourceMapper<TextResource, TextEntity> TextMapper { get; set; }

        protected override IRelationship<SFProjectEntity> GetRelationship(string relationshipName)
        {
            switch (relationshipName)
            {
                case nameof(SFProjectResource.ActiveSyncJob):
                    return Custom(SyncJobMapper, p =>
                        {
                            return j => j.ProjectRef == p.Id && SyncJobEntity.ActiveStates.Contains(j.State);
                        });
                case nameof(SFProjectResource.Users):
                    return OneToMany(ProjectUserMapper, u => u.ProjectRef);
                case nameof(SFProjectResource.Texts):
                    return OneToMany(TextMapper, t => t.ProjectRef);
            }
            return base.GetRelationship(relationshipName);
        }

        protected override Task CheckCanCreateAsync(SFProjectResource resource)
        {
            return Task.CompletedTask;
        }

        protected override Task CheckCanUpdateAsync(string id, IDictionary<string, object> attrs,
            IDictionary<string, string> relationships)
        {
            return CheckCanUpdateDeleteAsync(id);
        }

        protected override Task CheckCanUpdateRelationshipAsync(string id)
        {
            return CheckCanUpdateDeleteAsync(id);
        }

        protected override Task CheckCanDeleteAsync(string id)
        {
            return CheckCanUpdateDeleteAsync(id);
        }

        protected override Task<IQueryable<SFProjectEntity>> ApplyPermissionFilterAsync(
            IQueryable<SFProjectEntity> query)
        {
            if (SystemRole == SystemRoles.User)
                query = query.Where(p => p.Users.Any(u => u.UserRef == UserId));
            return Task.FromResult(query);
        }

        protected override IQueryable<SFProjectEntity> ApplyFilter(IQueryable<SFProjectEntity> entities,
            FilterQuery filter)
        {
            if (filter.Attribute == "search")
            {
                string value = filter.Value.ToLowerInvariant();
                return entities.Where(p => p.ProjectName.ToLowerInvariant().Contains(value)
                    || p.InputSystem.LanguageName.ToLowerInvariant().Contains(value));
            }
            return base.ApplyFilter(entities, filter);
        }

        private async Task CheckCanUpdateDeleteAsync(string id)
        {
            if (SystemRole == SystemRoles.User)
            {
                Attempt<SFProjectEntity> attempt = await Entities.TryGetAsync(id);
                if (attempt.TryResult(out SFProjectEntity project))
                {
                    if (!project.Users.Any(u => u.UserRef == UserId))
                        throw ForbiddenException();
                }
                else
                {
                    throw NotFoundException();
                }
            }
        }
    }
}
