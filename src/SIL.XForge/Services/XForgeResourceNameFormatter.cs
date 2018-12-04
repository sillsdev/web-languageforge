using System;
using System.Reflection;
using JsonApiDotNetCore.Extensions;
using JsonApiDotNetCore.Graph;
using JsonApiDotNetCore.Models;

namespace SIL.XForge.Services
{
    /// <summary>
    /// This class formats resource and property names. This class is a modified version of the default implementation
    /// in JsonApiDotNetCore. It has been modified to strip the "Resource" suffix off of resource class names.
    /// </summary>
    public class XForgeResourceNameFormatter : IResourceNameFormatter
    {
        public string ApplyCasingConvention(string propertyName)
        {
            return propertyName.Dasherize();
        }

        public string FormatPropertyName(PropertyInfo property)
        {
            return property.Name.Dasherize();
        }

        public string FormatResourceName(Type resourceType)
        {
            try
            {
                // check the class definition first
                // [Resource("models"] public class Model : Identifiable { /* ... */ }
                if (resourceType.GetCustomAttribute(typeof(ResourceAttribute)) is ResourceAttribute attribute)
                    return attribute.ResourceName;

                string resourceName = resourceType.Name;
                if (resourceName.EndsWith("Resource"))
                    resourceName = resourceName.Substring(0, resourceName.Length - "Resource".Length);
                return ApplyCasingConvention(Humanizer.InflectorExtensions.Pluralize(resourceName));
            }
            catch (InvalidOperationException e)
            {
                throw new InvalidOperationException(
                    $"Cannot define multiple {nameof(ResourceAttribute)}s on type '{resourceType}'.", e);
            }
        }
    }
}
