using AutoMapper;
using SIL.XForge.Scripture.Models;

namespace SIL.XForge.Scripture.Services
{
    public class SFMapperProfile : Profile
    {
        public SFMapperProfile()
        {
            CreateMap<SFProjectUserEntity, SFProjectUserResource>()
                .ReverseMap();
        }
    }
}
