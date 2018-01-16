using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using SIL.XForge.WebApi.Server.Dtos;
using SIL.XForge.WebApi.Server.Dtos.Lexicon;
using SIL.XForge.WebApi.Server.Models;
using SIL.XForge.WebApi.Server.Models.Lexicon;

namespace SIL.XForge.WebApi.Server.Controllers
{
    public class ModelToDtoProfile : Profile
    {
        public ModelToDtoProfile()
        {
            CreateMap<LexConfig, LexConfigDto>();
            CreateMap<LexConfigFieldList, LexConfigFieldListDto>()
                .IncludeBase<LexConfig, LexConfigDto>();
            CreateMap<LexConfigOptionList, LexConfigOptionListDto>()
                .IncludeBase<LexConfig, LexConfigDto>();
            CreateMap<LexConfigMultiText, LexConfigMultiTextDto>()
                .IncludeBase<LexConfig, LexConfigDto>();
            CreateMap<LexConfigPictures, LexConfigPicturesDto>()
                .IncludeBase<LexConfigMultiText, LexConfigMultiTextDto>();

            CreateMap<LexTask, LexTaskDto>();
            CreateMap<LexTaskDashboard, LexTaskDashboardDto>()
                .IncludeBase<LexTask, LexTaskDto>();
            CreateMap<LexTaskSemdom, LexTaskSemdomDto>()
                .IncludeBase<LexTask, LexTaskDto>();

            CreateMap<LexViewFieldConfig, LexViewFieldConfigDto>();
            CreateMap<LexViewMultiTextFieldConfig, LexViewMultiTextFieldConfigDto>()
                .IncludeBase<LexViewFieldConfig, LexViewFieldConfigDto>();

            CreateMap<LexProject, LexProjectDto>()
                .AfterMap<LexProjectHrefAction>();

            CreateMap<SendReceiveJob, SendReceiveJobDto>()
                .ForMember(d => d.Project, o => o.MapFrom(s => new ResourceDto { Id = s.ProjectRef }))
                .AfterMap<SendReceiveJobHrefAction>();

            CreateMap<ParatextUserInfo, ParatextUserInfoDto>();
        }

        private class HrefAction<TSource, TDestination> : IMappingAction<TSource, TDestination>
            where TDestination : ResourceDto
        {
            private readonly string _routeName;
            private readonly string _idName;

            protected HrefAction(IUrlHelper urlHelper, string routeName, string idName = "id")
            {
                Url = urlHelper;
                _routeName = routeName;
                _idName = idName;
            }

            protected IUrlHelper Url { get; }

            public virtual void Process(TSource source, TDestination destination)
            {
                destination.Href = Url.FullRouteUrl(_routeName, _idName, destination.Id);
            }
        }

        private class SendReceiveJobHrefAction : HrefAction<SendReceiveJob, SendReceiveJobDto>
        {
            public SendReceiveJobHrefAction(IUrlHelper urlHelper)
                : base(urlHelper, RouteNames.SendReceiveJob)
            {
            }
        }

        private class LexProjectHrefAction : HrefAction<LexProject, LexProjectDto>
        {
            public LexProjectHrefAction(IUrlHelper urlHelper)
                : base(urlHelper, RouteNames.Lexicon)
            {
            }
        }
    }
}
