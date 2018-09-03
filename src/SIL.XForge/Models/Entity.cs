using System;

namespace SIL.XForge.Models
{
    public class Entity
    {
        public string Id { get; protected set; }
        public DateTime DateModified { get; set; }
        public DateTime DateCreated { get; set; }
        public string OwnerRef { get; set; }
    }
}
