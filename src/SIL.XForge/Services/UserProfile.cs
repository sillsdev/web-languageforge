using System.Collections.Generic;
using AutoMapper;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public class UserProfile : Profile
    {
        public UserProfile(string site)
        {
            CreateMap<UserEntity, UserResource>()
                .ForMember(ur => ur.Password, o => o.Ignore())
                .ForMember(ur => ur.Site, o => o.MapFrom(ue => ue.Sites.ContainsKey(site) ? ue.Sites[site] : null))
                .ReverseMap()
                .ForPath(ue => ue.Sites, opt => opt.MapFrom(ur => new Dictionary<string, Site>
                    {
                        { site, ur.Site }
                    }));
        }
    }
}
