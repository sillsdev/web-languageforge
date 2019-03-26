using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using JsonApiDotNetCore.Services;
using SIL.XForge.DataAccess;
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

        protected override int Domain => SFDomain.Texts;

        public override async Task DeleteAllAsync(string projectId)
        {
            List<TextEntity> texts = await Entities.Query().Where(t => t.ProjectRef == projectId).ToListAsync();

            await _realtimeService.DeleteAllAsync("text", GetAllTextDataIds(texts));
            await _realtimeService.DeleteAllAsync("question", GetAllJsonDataIds(texts));
            await _realtimeService.DeleteAllAsync("comment", GetAllJsonDataIds(texts));
            await base.DeleteAllAsync(projectId);
        }

        private static IEnumerable<string> GetAllTextDataIds(IEnumerable<TextEntity> texts)
        {
            foreach (TextEntity text in texts)
            {
                foreach (Chapter chapter in text.Chapters)
                {
                    yield return TextEntity.GetTextDataId(text.Id, chapter.Number, TextType.Source);
                    yield return TextEntity.GetTextDataId(text.Id, chapter.Number, TextType.Target);
                }
            }
        }

        private static IEnumerable<string> GetAllJsonDataIds(IEnumerable<TextEntity> texts)
        {
            foreach (TextEntity text in texts)
            {
                foreach (Chapter chapter in text.Chapters)
                {
                    yield return TextEntity.GetJsonDataId(text.Id, chapter.Number);
                }
            }
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
