using System.Linq;
using AutoMapper;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Http;
using SIL.XForge.DataAccess;
using SIL.XForge.Scripture.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Scripture.Services
{
    public class SFProjectService : ProjectService<SFProjectResource, SFProjectEntity>
    {
        public SFProjectService(IJsonApiContext jsonApiContext, IRepository<SFProjectEntity> entities, IMapper mapper,
            IHttpContextAccessor httpContextAccessor)
            : base(jsonApiContext, entities, mapper, httpContextAccessor)
        {
        }

        public IResourceQueryable<SendReceiveJobResource, SendReceiveJobEntity> SendReceiveJobResources { get; set; }

        protected override IRelationship<SFProjectEntity> GetRelationship(string relationshipName)
        {
            switch (relationshipName)
            {
                case SFProjectResource.ActiveSendReceiveJobRelationship:
                    return Custom(SendReceiveJobResources,
                        p => { return j => j.ProjectRef == p.Id && SendReceiveJobEntity.ActiveStates.Contains(j.State); });
            }
            return base.GetRelationship(relationshipName);
        }
    }
}
