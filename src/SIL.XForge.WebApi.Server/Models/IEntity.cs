using System;

namespace SIL.XForge.WebApi.Server.Models
{
    public interface IEntity
    {
        string Id { get; }
        DateTime DateModified { get; set; }
        DateTime DateCreated { get; set; }
    }
}
