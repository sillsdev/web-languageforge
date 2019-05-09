using System;
using System.Threading.Tasks;

namespace ShareDB
{
    public interface IConnection : IDisposable
    {
        Task StartAsync();
        IDocument<T> Get<T>(string collection, string id);
    }
}
