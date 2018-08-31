using AutoMapper;
using SIL.XForge.Scripture.Models;

namespace SIL.XForge.Scripture.Services
{
    public class ScriptureResourceEntityProfile : Profile
    {
        public ScriptureResourceEntityProfile()
        {
            CreateMap<ScriptureProjectEntity, ScriptureProjectResource>()
                .ReverseMap();
        }
    }
}
