using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using JsonApiDotNetCore.Services;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;
using SIL.XForge.Realtime;
using SIL.XForge.Scripture.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Scripture.Services
{
    public class TextService : SFProjectDataService<TextResource, TextEntity>
    {
        private readonly IRealtimeService _realtimeService;

        public TextService(IJsonApiContext jsonApiContext, IMapper mapper, IUserAccessor userAccessor,
            IRepository<TextEntity> entities, IRepository<SFProjectEntity> projects, IRealtimeService realtimeService)
            : base(jsonApiContext, mapper, userAccessor, entities, projects)
        {
            _realtimeService = realtimeService;
        }

        protected override Domain Domain => Domain.Texts;

        public override async Task DeleteAllAsync(string projectId)
        {
            List<string> ids = await Entities.Query().Where(t => t.ProjectRef == projectId).ToListAsync(t => t.Id);
            string[] textTypes = { "source", "target" };
            await _realtimeService.DeleteAllAsync("text",
                ids.SelectMany(id => textTypes, (id, type) => id + ":" + type));
            await base.DeleteAllAsync(projectId);
        }

        protected override Task CheckCanCreateAsync(TextResource resource)
        {
            throw UnsupportedRequestMethodException();
        }

        protected override Task CheckCanDeleteAsync(string id)
        {
            throw UnsupportedRequestMethodException();
        }
    }
}
