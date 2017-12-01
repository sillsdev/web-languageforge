using MongoDB.Driver;
using SIL.XForge.WebApi.Server.Models;

namespace SIL.XForge.WebApi.Server.DataAccess
{
    public class MongoProjectRepositoryFactory<T> : IProjectRepositoryFactory<T> where T : IEntity
    {
        private readonly IMongoClient _mongoClient;
        private readonly string _collectionName;

        public MongoProjectRepositoryFactory(IMongoClient mongoClient, string collectionName)
        {
            _mongoClient = mongoClient;
            _collectionName = collectionName;
        }

        public IRepository<T> Get(string projectCode)
        {
            return new MongoRepository<T>(_mongoClient.GetDatabase("sf_" + projectCode)
                .GetCollection<T>(_collectionName));
        }
    }
}
