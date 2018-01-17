using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIL.XForge.WebApi.Server.Dtos;

namespace SIL.XForge.WebApi.Server.Controllers
{
    [Authorize]
    public abstract class ResourceController : Controller
    {
        private readonly IMapper _mapper;

        protected ResourceController(IMapper mapper)
        {
            _mapper = mapper;
        }

        protected string UserId
        {
            get { return User.GetUserId(); }
        }

        protected T Map<T>(object obj, string routeName, object values = null) where T : ResourceDto
        {
            var dto = _mapper.Map<T>(obj);
            dto.Href = Url.FullRouteUrl(routeName, values);
            return dto;
        }

        protected T Map<T>(object obj)
        {
            return _mapper.Map<T>(obj);
        }

        protected ResourceDto Map(string id, string routeName, string idName = "id")
        {
            return new ResourceDto
            {
                Id = id,
                Href = Url.FullRouteUrl(routeName, idName, id)
            };
        }
    }
}
