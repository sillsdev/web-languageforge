using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NSubstitute;
using NUnit.Framework;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    [TestFixture]
    public class HasOneRelationshipTests
    {
        [Test]
        public async Task GetResourcesAsync_ValidRelationship()
        {
            var projectResource = new TestProjectResource
            {
                Id = "project1",
                ProjectName = "Test"
            };
            var projectResourceMapper = Substitute.For<IResourceMapper<TestProjectResource, TestProjectEntity>>();
            IEnumerable<TestProjectResource> projectResources = new[] { projectResource };
            projectResourceMapper.MapMatchingAsync(null, null, null)
                .ReturnsForAnyArgs(Task.FromResult(projectResources));

            var rel = new HasOneRelationship<ProjectDataEntity, TestProjectResource, TestProjectEntity>(
                projectResourceMapper, e => e.ProjectRef);
            var entity = new ProjectDataEntity
            {
                Id = "entity1",
                ProjectRef = "project1"

            };
            IEnumerable<IResource> result = await rel.GetResourcesAsync(Enumerable.Empty<string>(),
                new Dictionary<string, IResource>(), entity);
            Assert.That(result, Is.EqualTo(new[] { projectResource }));
        }
    }
}
