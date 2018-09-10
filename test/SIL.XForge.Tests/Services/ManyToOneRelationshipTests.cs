using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NSubstitute;
using NUnit.Framework;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    [TestFixture]
    public class ManyToOneRelationshipTests
    {
        [Test]
        public async Task GetResourcesAsync_ValidRelationship()
        {
            var projectResource = new ProjectResource
            {
                Id = "project1",
                ProjectName = "Test"
            };
            var projectrResources = Substitute.For<IResourceQueryable<ProjectResource, ProjectEntity>>();
            projectrResources.QueryAsync(null, null, null)
                .ReturnsForAnyArgs(Task.FromResult<IEnumerable<ProjectResource>>(new[] { projectResource }));

            var rel = new ManyToOneRelationship<ProjectDataEntity, ProjectResource, ProjectEntity>(projectrResources,
                e => e.ProjectRef);
            var entity = new ProjectDataEntity
            {
                Id = "entity1",
                ProjectRef = "project1"

            };
            object result = await rel.GetResourcesAsync(Enumerable.Empty<string>(), new Dictionary<string, Resource>(),
               entity);
            Assert.That(result, Is.EqualTo(projectResource));
        }
    }
}
