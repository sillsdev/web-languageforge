using System.Collections.Generic;
using JsonApiDotNetCore.Models;
using SIL.XForge.Models;

namespace SIL.XForge.Scripture.Models
{
    public class SFProjectResource : ProjectResource
    {
        [Attr("paratext-id", isImmutable: true)]
        public string ParatextId { get; set; }
        [Attr("checking-config")]
        public CheckingConfig CheckingConfig { get; set; }
        [Attr("translate-config")]
        public TranslateConfig TranslateConfig { get; set; }
        [Attr("input-system")]
        public InputSystem InputSystem { get; set; }

        [HasOne("active-sync-job")]
        public SyncJobResource ActiveSyncJob { get; set; }
        [HasMany("users")]
        [SchemaInfo(Inverse = nameof(SFProjectUserResource.Project), IsDependent = true)]
        public IReadOnlyList<SFProjectUserResource> Users { get; set; }
        [HasMany("texts")]
        [SchemaInfo(Inverse = nameof(TextResource.Project), IsDependent = true)]
        public IReadOnlyList<TextResource> Texts { get; set; }
    }
}
