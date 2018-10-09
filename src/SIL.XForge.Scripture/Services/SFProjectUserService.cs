using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Models;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Http;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;
using SIL.XForge.Scripture.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Scripture.Services
{
    public class SFProjectUserService : ResourceServiceBase<SFProjectUserResource, SFProjectUserEntity>
    {
        private readonly IRepository<SFProjectEntity> _projects;
        private readonly IRepository<UserEntity> _users;
        private readonly IParatextService _paratextService;

        public SFProjectUserService(IJsonApiContext jsonApiContext, IMapper mapper, IUserAccessor userAccessor,
            IRepository<SFProjectEntity> projects, IRepository<UserEntity> users, IParatextService paratextService)
            : base(jsonApiContext, mapper, userAccessor)
        {
            _projects = projects;
            _users = users;
            _paratextService = paratextService;
        }

        public IResourceMapper<SFUserResource, UserEntity> UserMapper { get; set; }
        public IResourceMapper<SFProjectResource, SFProjectEntity> ProjectMapper { get; set; }

        protected override Task<IQueryable<SFProjectUserEntity>> ApplyPermissionFilterAsync(
            IQueryable<SFProjectUserEntity> query)
        {
            if (SystemRole == SystemRoles.User)
                query = query.Where(u => u.UserRef == UserId);
            return Task.FromResult(query);
        }

        protected override Task CheckCanCreateAsync(SFProjectUserResource resource)
        {
            if (resource.ProjectRef == null)
                throw new JsonApiException(StatusCodes.Status400BadRequest, "A project must be specified.");
            if (resource.UserRef == null)
                throw new JsonApiException(StatusCodes.Status400BadRequest, "A user must be specified.");

            if (SystemRole == SystemRoles.User)
            {
                if (resource.UserRef != UserId)
                    throw ForbiddenException();
            }
            return Task.CompletedTask;
        }

        protected override async Task CheckCanUpdateAsync(string id)
        {
            if (SystemRole == SystemRoles.User)
            {
                SFProjectUserEntity projectUser = await _projects.Query().SelectMany(p => p.Users)
                    .SingleOrDefaultAsync(u => u.Id == id);
                if (projectUser.UserRef != UserId)
                    throw ForbiddenException();
            }
        }

        protected override Task CheckCanUpdateRelationshipAsync(string id)
        {
            throw UnsupportedRequestMethodException();
        }

        protected override Task CheckCanDeleteAsync(string id)
        {
            return CheckCanUpdateAsync(id);
        }

        protected override IQueryable<SFProjectUserEntity> GetEntityQueryable()
        {
            return _projects.Query().SelectMany(p => p.Users, (p, u) => new SFProjectUserEntity
                {
                    Id = u.Id,
                    UserRef = u.UserRef,
                    ProjectRef = p.Id,
                    Role = u.Role,
                    TranslateConfig = u.TranslateConfig
                });
        }

        protected override async Task<object> GetRelationshipResourcesAsync(RelationshipAttribute relAttr,
            IEnumerable<string> included, Dictionary<string, IResource> resources, SFProjectUserEntity entity)
        {
            switch (relAttr.InternalRelationshipName)
            {
                case nameof(SFProjectUserResource.User):
                    return (await UserMapper.MapMatchingAsync(included, resources, u => u.Id == entity.UserRef))
                        .SingleOrDefault();
                case nameof(SFProjectUserResource.Project):
                    return (await ProjectMapper.MapMatchingAsync(included, resources, p => p.Id == entity.ProjectRef))
                        .SingleOrDefault();
            }
            return null;
        }

        protected override async Task<SFProjectUserEntity> InsertEntityAsync(SFProjectUserEntity entity)
        {
            string paratextId = await _projects.Query().Where(p => p.Id == entity.ProjectRef).Select(p => p.ParatextId)
                .SingleOrDefaultAsync();
            if (paratextId == null)
            {
                throw new JsonApiException(StatusCodes.Status400BadRequest,
                    "The specified project could not be found.");
            }
            UserEntity user = await _users.GetAsync(UserId);
            entity.Role = await _paratextService.GetProjectRoleAsync(user, paratextId);
            if (entity.Role != SFProjectRoles.Administrator)
                throw ForbiddenException();
            SFProjectEntity project = await _projects.UpdateAsync(p => p.Id == entity.ProjectRef, update => update
                .Add(p => p.Users, entity));
            return project.Users.FirstOrDefault(u => u.Id == entity.Id);
        }

        protected override async Task<SFProjectUserEntity> UpdateEntityAsync(string id,
            IDictionary<string, object> attrs, IDictionary<string, string> relationships)
        {
            SFProjectEntity project = await _projects.UpdateAsync(p => p.Users.Any(u => u.Id == id), update =>
                {
                    foreach (KeyValuePair<string, object> attr in attrs)
                        update.Set(p => p.Users, attr.Key, attr.Value);
                });
            return project.Users.FirstOrDefault(u => u.Id == id);
        }

        protected override Task<SFProjectUserEntity> UpdateEntityRelationshipAsync(string id, string propertyName,
            IEnumerable<string> relationshipIds)
        {
            throw new NotImplementedException();
        }

        protected override async Task<bool> DeleteEntityAsync(string id)
        {
            return (await _projects.UpdateAsync(p => p.Users.Any(u => u.Id == id), update => update
                .RemoveAll(p => p.Users, u => u.Id == id))) != null;
        }
    }
}
