using System;

namespace SIL.XForge.Models
{
    [AttributeUsage(AttributeTargets.Property)]
    public class SchemaInfoAttribute : Attribute
    {
        public string Inverse { get; set; }
        public bool IsDependent { get; set; }
    }
}
