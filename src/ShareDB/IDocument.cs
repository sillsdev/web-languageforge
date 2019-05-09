using System.Collections.Generic;
using System.Threading.Tasks;

namespace ShareDB
{
    public interface IDocument<T>
    {
        IConnection Connection { get; }
        string Collection { get; }
        string Id { get; }
        int Version { get; }
        IOTType Type { get; }
        T Data { get; }
        bool IsLoaded { get; }

        Task<bool> CreateAsync(T op);
        Task<bool> CreateAsync(IEnumerable<T> ops);

        Task<bool> FetchAsync();

        Task<bool> SubmitOpAsync(T op);
        Task<bool> SubmitOpsAsync(IEnumerable<T> ops);

        Task<bool> DeleteAsync();
    }
}
