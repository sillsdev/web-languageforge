using System.Collections.Generic;
using JsonApiDotNetCore.Models;
using SIL.XForge.Models;

namespace SIL.XForge.Scripture.Models
{
    public class SFProjectResource : ProjectResource
    {
        [Attr(isImmutable: true)]
        public string ParatextId { get; set; }
        [Attr]
        public CheckingConfig CheckingConfig { get; set; }
        [Attr]
        public TranslateConfig TranslateConfig { get; set; }

        [HasOne]
        public SyncJobResource ActiveSyncJob { get; set; }
        [HasMany]
        [SchemaInfo(Inverse = nameof(TextResource.Project), IsDependent = true)]
        public IReadOnlyList<TextResource> Texts { get; set; }
    }
}
