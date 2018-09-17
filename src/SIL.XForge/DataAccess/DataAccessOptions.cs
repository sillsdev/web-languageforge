namespace SIL.XForge.DataAccess
{
    public class DataAccessOptions
    {
        public string ConnectionString { get; set; } = "mongodb://localhost:27017";
        public string JobDatabase { get; set; } = "jobs";
        public string MongoDatabaseName { get; set; } = "xforge";
    }
}
