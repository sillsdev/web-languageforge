using AutoMapper;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public class ResourceEntityProfile : Profile
    {
        public ResourceEntityProfile()
        {
            CreateMap<UserEntity, UserResource>()
                .ForMember(r => r.Projects, o => o.Ignore())
                .ReverseMap();

            CreateMap<ProjectEntity, ProjectResource>()
                .ReverseMap();
        }
    }
}
