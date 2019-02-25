using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Threading.Tasks;
using AutoMapper;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Models;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Http;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;
using SIL.XForge.Utils;

namespace SIL.XForge.Services
{
    public abstract class ProjectUserService<TResource, TEntity, TProjectEntity>
        : ResourceServiceBase<TResource, TEntity>, IResourceMapper<ProjectUserResource, ProjectUserEntity>
        where TResource : ProjectUserResource
        where TEntity : ProjectUserEntity
        where TProjectEntity : ProjectEntity
    {
        public ProjectUserService(IJsonApiContext jsonApiContext, IMapper mapper, IUserAccessor userAccessor,
            IRepository<TProjectEntity> projects)
            : base(jsonApiContext, mapper, userAccessor)
        {
            Projects = projects;
        }

        protected IRepository<TProjectEntity> Projects { get; }

        public IResourceMapper<UserResource, UserEntity> UserMapper { get; set; }
        public IResourceMapper<ProjectResource, ProjectEntity> ProjectMapper { get; set; }

        protected override async Task<object> GetRelationshipResourcesAsync(RelationshipAttribute relAttr,
            IEnumerable<string> included, Dictionary<string, IResource> resources, TEntity entity)
        {
            switch (relAttr.InternalRelationshipName)
            {
                case nameof(ProjectUserResource.User):
                    return (await UserMapper.MapMatchingAsync(included, resources, u => u.Id == entity.UserRef))
                        .SingleOrDefault();
                case nameof(ProjectUserResource.Project):
                    return (await ProjectMapper.MapMatchingAsync(included, resources, p => p.Id == entity.ProjectRef))
                        .SingleOrDefault();
            }
            return null;
        }

        protected override Task<IQueryable<TEntity>> ApplyPermissionFilterAsync(IQueryable<TEntity> query)
        {
            if (SystemRole == SystemRoles.User)
                query = query.Where(u => u.UserRef == UserId);
            return Task.FromResult(query);
        }

        protected override Task CheckCanCreateAsync(TResource resource)
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

        protected override async Task CheckCanUpdateAsync(string id, IDictionary<string, object> attrs,
            IDictionary<string, string> relationships)
        {
            await CheckCanUpdateDeleteAsync(id);
            if (SystemRole != SystemRoles.SystemAdmin && attrs.ContainsKey(nameof(ProjectUserResource.Role)))
                throw ForbiddenException();
        }

        protected override Task CheckCanUpdateRelationshipAsync(string id)
        {
            throw UnsupportedRequestMethodException();
        }

        protected override Task CheckCanDeleteAsync(string id)
        {
            return CheckCanUpdateDeleteAsync(id);
        }

        protected override IQueryable<TEntity> GetEntityQueryable()
        {
            return Projects.Query().SelectMany(p => p.Users, SelectProjectUser());
        }

        protected override async Task<TEntity> InsertEntityAsync(TEntity entity)
        {
            TProjectEntity project = await Projects.UpdateAsync(p => p.Id == entity.ProjectRef, update => update
                .Add(p => p.Users, entity));
            return GetProjectUser(project, entity.Id);
        }

        protected override async Task<TEntity> UpdateEntityAsync(string id,
            IDictionary<string, object> attrs, IDictionary<string, string> relationships)
        {
            TProjectEntity project = await Projects.UpdateAsync(p => p.Users.Any(pu => pu.Id == id),
                update =>
                {
                    foreach (KeyValuePair<string, object> attr in attrs)
                        update.Set(GetField(attr.Key), attr.Value);
                });
            return GetProjectUser(project, id);
        }

        protected override Task<TEntity> UpdateEntityRelationshipAsync(string id, string propertyName,
            IEnumerable<string> relationshipIds)
        {
            throw new NotImplementedException();
        }

        protected override async Task<bool> DeleteEntityAsync(string id)
        {
            return (await Projects.UpdateAsync(p => p.Users.Any(pu => pu.Id == id), update => update
                .RemoveAll(p => p.Users, u => u.Id == id))) != null;
        }

        protected Expression<Func<TProjectEntity, ProjectUserEntity, TEntity>> SelectProjectUser()
        {
            Type entityType = typeof(TEntity);
            ParameterExpression projectParam = Expression.Parameter(typeof(TProjectEntity), "p");
            ParameterExpression projectUserParam = Expression.Parameter(typeof(ProjectUserEntity), "u");
            NewExpression newExpr = Expression.New(entityType);
            var bindings = new List<MemberBinding>();
            foreach (PropertyInfo propInfo in entityType.GetProperties())
            {
                MemberExpression propExpr;
                if (propInfo.Name == nameof(ProjectUserEntity.ProjectRef))
                {
                    propExpr = Expression.Property(projectParam, nameof(ProjectEntity.Id));
                }
                else
                {
                    UnaryExpression castExpr = Expression.Convert(projectUserParam, typeof(TEntity));
                    propExpr = Expression.Property(castExpr, propInfo);
                }
                bindings.Add(Expression.Bind(propInfo, propExpr));
            }
            MemberInitExpression memberInitExpr = Expression.MemberInit(newExpr, bindings);
            return Expression.Lambda<Func<TProjectEntity, ProjectUserEntity, TEntity>>(memberInitExpr, projectParam,
                projectUserParam);
        }

        private async Task CheckCanUpdateDeleteAsync(string id)
        {
            if (SystemRole == SystemRoles.User)
            {
                ProjectUserEntity projectUser = await Projects.Query().SelectMany(p => p.Users)
                    .SingleOrDefaultAsync(u => u.Id == id);
                if (projectUser.UserRef != UserId)
                    throw ForbiddenException();
            }
        }

        private static TEntity GetProjectUser(TProjectEntity project, string id)
        {
            TEntity projectUser = project.Users.Cast<TEntity>().FirstOrDefault(pu => pu.Id == id);
            if (projectUser != null)
                projectUser.ProjectRef = project.Id;
            return projectUser;
        }

        private static Expression<Func<TProjectEntity, object>> GetField(string fieldName)
        {
            Expression<Func<TProjectEntity, TEntity>> getProjectUserExpr = p => (TEntity)p.Users[-1];
            Expression body = Expression.Convert(Expression.Property(getProjectUserExpr.Body, fieldName),
                typeof(object));
            return Expression.Lambda<Func<TProjectEntity, object>>(body, getProjectUserExpr.Parameters);
        }

        async Task<ProjectUserResource> IResourceMapper<ProjectUserResource, ProjectUserEntity>.MapAsync(
            IEnumerable<string> included, Dictionary<string, IResource> resources, ProjectUserEntity entity)
        {
            return await MapAsync(included, resources, (TEntity)entity);
        }

        async Task<IEnumerable<ProjectUserResource>> IResourceMapper<ProjectUserResource, ProjectUserEntity>.MapMatchingAsync(
            IEnumerable<string> included, Dictionary<string, IResource> resources,
            Expression<Func<ProjectUserEntity, bool>> predicate)
        {
            return await MapMatchingAsync(included, resources, ExpressionHelper.ChangePredicateType<TEntity>(predicate));
        }
    }
}
