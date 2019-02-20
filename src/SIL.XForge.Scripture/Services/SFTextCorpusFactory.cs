using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using SIL.Machine.Corpora;
using SIL.Machine.Tokenization;
using SIL.Machine.WebApi;
using SIL.Machine.WebApi.Models;
using SIL.Machine.WebApi.Services;
using SIL.XForge.Configuration;
using SIL.XForge.DataAccess;
using SIL.XForge.Scripture.Models;

namespace SIL.XForge.Scripture.Services
{
    public class SFTextCorpusFactory : ITextCorpusFactory
    {
        private readonly IMongoClient _mongoClient;
        private readonly Machine.WebApi.DataAccess.IRepository<Project> _machineProjects;
        private readonly IRepository<TextEntity> _texts;
        private readonly IOptions<DataAccessOptions> _dataAccessOptions;

        public SFTextCorpusFactory(IOptions<DataAccessOptions> dataAccessOptions,
            Machine.WebApi.DataAccess.IRepository<Project> machineProjects, IRepository<TextEntity> texts)
        {
            _dataAccessOptions = dataAccessOptions;
            _mongoClient = new MongoClient(dataAccessOptions.Value.ConnectionString);
            _machineProjects = machineProjects;
            _texts = texts;
        }

        public async Task<ITextCorpus> CreateAsync(IEnumerable<string> projects, TextCorpusType type)
        {
            return new DictionaryTextCorpus(await CreateTextsAsync(projects, type));
        }

        private async Task<IReadOnlyList<IText>> CreateTextsAsync(IEnumerable<string> projects,
            TextCorpusType type)
        {
            StringTokenizer wordTokenizer = new LatinWordTokenizer();
            IMongoDatabase database = _mongoClient.GetDatabase(_dataAccessOptions.Value.MongoDatabaseName);
            IMongoCollection<BsonDocument> textDataColl = database.GetCollection<BsonDocument>("text_data");
            var texts = new List<IText>();
            foreach (string projectId in projects)
            {
                Project project = await _machineProjects.GetAsync(projectId);
                if (project == null)
                    continue;

                string segmentType = null;
                string suffix = null;
                switch (type)
                {
                    case TextCorpusType.Source:
                        suffix = "source";
                        segmentType = project.SourceSegmentType;
                        break;
                    case TextCorpusType.Target:
                        suffix = "target";
                        segmentType = project.TargetSegmentType;
                        break;
                }
                StringTokenizer segmentTokenizer = null;
                if (segmentType != null)
                    segmentTokenizer = WebApiUtils.CreateSegmentTokenizer(segmentType);

                List<TextEntity> textList = await _texts.Query().Where(t => t.ProjectRef == projectId).ToListAsync();
                foreach (TextEntity text in textList)
                {
                    FilterDefinition<BsonDocument> filter = Builders<BsonDocument>.Filter
                        .Eq("_id", $"{text.Id}:{suffix}");
                    BsonDocument doc = await textDataColl.Find(filter).FirstAsync();
                    texts.Add(new SFScriptureText(wordTokenizer, project.Id, doc));
                }
            }

            return texts;
        }
    }
}
