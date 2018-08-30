using AutoMapper;
using SIL.XForge.WebApi.Server.Models;

namespace SIL.XForge.WebApi.Server.Services
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
