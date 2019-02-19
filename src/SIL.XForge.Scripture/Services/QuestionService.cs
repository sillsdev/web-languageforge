using AutoMapper;
using JsonApiDotNetCore.Services;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;
using SIL.XForge.Scripture.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Scripture.Services
{
    public class QuestionService : SFProjectDataService<QuestionResource, QuestionEntity>
    {
        public QuestionService(IJsonApiContext jsonApiContext, IMapper mapper, IUserAccessor userAccessor,
            IRepository<QuestionEntity> entities, IRepository<SFProjectEntity> projects)
            : base(jsonApiContext, mapper, userAccessor, entities, projects)
        {
        }

        protected override Domain Domain => Domain.Questions;
    }
}
