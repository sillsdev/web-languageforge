using System.Linq;
using AutoMapper;
using JsonApiDotNetCore.Services;
using SIL.XForge.DataAccess;
using SIL.XForge.Scripture.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Scripture.Services
{
    public class SFProjectService : ProjectService<SFProjectResource, SFProjectEntity>
    {
        public SFProjectService(IJsonApiContext jsonApiContext, IRepository<SFProjectEntity> entities, IMapper mapper,
            IUserAccessor userAccessor)
            : base(jsonApiContext, entities, mapper, userAccessor)
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
