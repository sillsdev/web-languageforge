using System.Collections.Generic;
using System.Threading.Tasks;
using SIL.XForge.Models;
using SIL.XForge.Scripture.Models;

namespace SIL.XForge.Scripture.Services
{
    public interface IParatextService
    {
        Task<IReadOnlyList<ParatextProject>> GetProjectsAsync(UserEntity user);
        string GetParatextUsername(UserEntity user);
        Task<string> GetProjectRoleAsync(UserEntity user, string paratextId);
        Task<IReadOnlyList<string>> GetBooksAsync(UserEntity user, string projectId);
        Task<string> GetBookTextAsync(UserEntity user, string projectId, string bookId);
        Task<string> UpdateBookTextAsync(UserEntity user, string projectId, string bookId, string revision,
           string usxText);
    }
}
