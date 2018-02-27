using System;

namespace SIL.XForge.WebApi.Server.Models
{
    public abstract class EntityBase : IEntity
    {
        public string Id { get; protected set; }
        public DateTime DateModified { get; set; }
        public DateTime DateCreated { get; set; }
    }
}
