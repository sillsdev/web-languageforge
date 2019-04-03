using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using SIL.Machine.Corpora;
using SIL.Machine.Tokenization;
using SIL.Machine.WebApi.Services;
using SIL.XForge.Configuration;
using SIL.XForge.DataAccess;
using SIL.XForge.Scripture.DataAccess;
using SIL.XForge.Scripture.Models;

namespace SIL.XForge.Scripture.Services
{
    public class SFTextCorpusFactory : ITextCorpusFactory
    {
        private readonly IMongoClient _mongoClient;
        private readonly IRepository<TextEntity> _texts;
        private readonly IOptions<DataAccessOptions> _dataAccessOptions;

        public SFTextCorpusFactory(IOptions<DataAccessOptions> dataAccessOptions, IRepository<TextEntity> texts)
        {
            _dataAccessOptions = dataAccessOptions;
            _mongoClient = new MongoClient(dataAccessOptions.Value.ConnectionString);
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
            IMongoCollection<BsonDocument> textDataColl = database.GetCollection<BsonDocument>(
                SFDataAccessConstants.TextDataCollectionName);
            var texts = new List<IText>();
            foreach (string projectId in projects)
            {
                TextType textType;
                switch (type)
                {
                    case TextCorpusType.Source:
                        textType = TextType.Source;
                        break;
                    case TextCorpusType.Target:
                        textType = TextType.Target;
                        break;
                    default:
                        throw new InvalidEnumArgumentException(nameof(type), (int)type, typeof(TextType));
                }

                List<TextEntity> textList = await _texts.Query().Where(t => t.ProjectRef == projectId).ToListAsync();
                foreach (TextEntity text in textList)
                {
                    foreach (Chapter chapter in text.Chapters)
                    {
                        FilterDefinition<BsonDocument> filter = Builders<BsonDocument>.Filter
                            .Eq("_id", TextEntity.GetTextDataId(text.Id, chapter.Number, textType));
                        BsonDocument doc = await textDataColl.Find(filter).FirstAsync();
                        texts.Add(new SFScriptureText(wordTokenizer, projectId, text.Id, chapter.Number, doc));
                    }
                }
            }

            return texts;
        }
    }
}
