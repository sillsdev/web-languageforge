using System.Linq;
using System.Threading.Tasks;
using SIL.Machine.WebApi.Models;
using SIL.Machine.WebApi.Services;
using SIL.XForge.DataAccess;
using SIL.XForge.Scripture.Models;

public class SFBuildHandler : BuildHandler
{
    private readonly IRepository<SFProjectEntity> _projects;

    public SFBuildHandler(IRepository<SFProjectEntity> projects)
    {
        _projects = projects;
    }

    public override Task OnCompleted(BuildContext context)
    {
        return _projects.UpdateAsync(context.Engine.Projects.First(), u => u
            .Unset(p => ((SFProjectUserEntity)p.Users[ArrayPosition.All]).TranslateConfig.SelectedSegmentChecksum));
    }
}
