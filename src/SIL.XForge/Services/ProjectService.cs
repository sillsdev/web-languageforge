using System;
using System.Linq.Expressions;
using AutoMapper;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Http;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public class ProjectService<TResource, TEntity> : ProjectDataServiceBase<TResource, TEntity, TResource, TEntity>
        where TResource : ProjectResource
        where TEntity : ProjectEntity
    {
        public ProjectService(IJsonApiContext jsonApiContext, IRepository<TEntity> entities,
            IMapper mapper, IHttpContextAccessor httpContextAccessor)
            : base(jsonApiContext, entities, entities, mapper, httpContextAccessor)
        {
        }

        protected override Domain Domain => Domain.Projects;

        protected override Expression<Func<TEntity, bool>> IsInProject(string projectId)
        {
            return p => p.Id == projectId;
        }

        protected override Expression<Func<TEntity, string>> ProjectRef()
        {
            return p => p.Id;
        }
    }
}
