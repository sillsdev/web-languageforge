using System;

namespace SIL.XForge.Models
{
    /// <summary>An Entity is what's stored in the database. See also Resource.</summary>
    public class Entity : IEntity
    {
        public string Id { get; set; }
        public DateTime DateModified { get; set; }
        public DateTime DateCreated { get; set; }
    }
}
