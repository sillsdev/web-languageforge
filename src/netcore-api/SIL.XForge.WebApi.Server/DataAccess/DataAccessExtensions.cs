using Hangfire;
using Hangfire.Mongo;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Bson.Serialization.IdGenerators;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Driver;
using SIL.XForge.WebApi.Server.Models;

namespace SIL.XForge.WebApi.Server.DataAccess
{
    public static class DataAccessExtensions
    {
        public static IServiceCollection AddMongoDataAccess(this IServiceCollection services,
            IConfiguration configuration)
        {
            IConfigurationSection dataAccessConfig = configuration.GetSection("DataAccess");
            string connectionString = dataAccessConfig.GetValue<string>("ConnectionString");
            services.AddHangfire(x => x.UseMongoStorage(connectionString, DbNames.Default));

            var pack = new ConventionPack();
            pack.Add(new CamelCaseElementNameConvention());
            ConventionRegistry.Register("Custom", pack, t => true);

            services.AddSingleton<IMongoClient>(sp => new MongoClient(connectionString));
            services.AddMongoRepository<SendReceiveJob>("send_receive");
            return services;
        }

        private static void AddMongoRepository<T>(this IServiceCollection services, string collectionName)
            where T : IEntity
        {
            BsonClassMap.RegisterClassMap<T>(cm =>
                {
                    cm.AutoMap();
                    cm.MapIdProperty(e => e.Id)
                        .SetIdGenerator(StringObjectIdGenerator.Instance)
                        .SetSerializer(new StringSerializer(BsonType.ObjectId));
                });
            services.AddSingleton<IRepository<T>>(sp => new MongoRepository<T>(sp.GetService<IMongoClient>(),
                collectionName));
        }
    }
}
