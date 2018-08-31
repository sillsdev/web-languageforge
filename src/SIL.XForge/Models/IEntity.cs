using System;

namespace SIL.XForge.Models
{
    public interface IEntity
    {
        string Id { get; }
        DateTime DateModified { get; set; }
        DateTime DateCreated { get; set; }
    }
}
