using System;

namespace SIL.XForge.Models
{
    public class Entity : IEntity
    {
        public string Id { get; set; }
        public DateTime DateModified { get; set; }
        public DateTime DateCreated { get; set; }
    }
}
