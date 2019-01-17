using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using JsonApiDotNetCore.Internal.Query;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Options;
using SIL.XForge.Configuration;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public abstract class UserService<TResource> : RepositoryResourceServiceBase<TResource, UserEntity>
        where TResource : UserResource
    {
        private readonly IOptions<SiteOptions> _options;

        protected UserService(IJsonApiContext jsonApiContext, IMapper mapper, IUserAccessor userAccessor,
            IRepository<UserEntity> users, IOptions<SiteOptions> options)
            : base(jsonApiContext, mapper, userAccessor, users)
        {
            _options = options;
        }

        protected override IQueryable<UserEntity> ApplyFilter(IQueryable<UserEntity> entities,
            FilterQuery filter)
        {
            if (filter.Attribute == "search")
            {
                string value = filter.Value.ToLowerInvariant();
                return entities.Where(u => u.Name.ToLowerInvariant().Contains(value)
                    || u.CanonicalEmail.Contains(UserEntity.CanonicalizeEmail(filter.Value)));
            }
            return base.ApplyFilter(entities, filter);
        }

        protected override Task<UserEntity> InsertEntityAsync(UserEntity entity)
        {
            if (!string.IsNullOrEmpty(entity.Username))
                entity.Username = UserEntity.NormalizeUsername(entity.Username);
            if (!string.IsNullOrEmpty(entity.Password))
                entity.Password = UserEntity.HashPassword(entity.Password);
            entity.CanonicalEmail = UserEntity.CanonicalizeEmail(entity.Email);
            return base.InsertEntityAsync(entity);
        }

        protected override void UpdateAttribute(IUpdateBuilder<UserEntity> update, string name, object value)
        {
            switch (name)
            {
                case nameof(UserResource.Username):
                    if (value == null)
                        update.Unset(u => u.Username);
                    else
                        update.Set(u => u.Username, UserEntity.NormalizeUsername((string)value));
                    break;
                case nameof(UserResource.Password):
                    update.Set(u => u.Password, UserEntity.HashPassword((string)value));
                    break;
                case nameof(UserResource.Email):
                    update.Set(u => u.Email, value);
                    update.Set(u => u.CanonicalEmail, UserEntity.CanonicalizeEmail((string)value));
                    break;
                case nameof(UserResource.ParatextId):
                    if (value == null)
                    {
                        update.Unset(u => u.ParatextId);
                        update.Unset(u => u.ParatextTokens);
                    }
                    break;
                case nameof(UserResource.Site):
                    SiteOptions siteOptions = _options.Value;
                    string site = siteOptions.Origin.Authority;
                    if (value == null)
                        update.RemoveDictionaryValue(u => u.Sites, site);
                    else
                        update.SetDictionaryValue(u => u.Sites, site, value);
                    break;
                default:
                    base.UpdateAttribute(update, name, value);
                    break;
            }
        }

        protected override Task CheckCanCreateAsync(TResource resource)
        {
            if (SystemRole == SystemRoles.User)
                throw ForbiddenException();
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

        protected override Task<IQueryable<UserEntity>> ApplyPermissionFilterAsync(IQueryable<UserEntity> query)
        {
            if (SystemRole == SystemRoles.User)
                query = query.Where(u => u.Id == UserId);
            return Task.FromResult(query);
        }

        private Task CheckCanUpdateDeleteAsync(string id)
        {
            if (SystemRole == SystemRoles.User && id != UserId)
                throw ForbiddenException();
            return Task.CompletedTask;
        }
    }
}
