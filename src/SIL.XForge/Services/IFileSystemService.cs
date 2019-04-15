using System.Collections.Generic;
using System.IO;

namespace SIL.XForge.Services
{
    public interface IFileSystemService
    {
        Stream CreateFile(string path);
        bool FileExists(string path);
        Stream OpenFile(string path, FileMode mode);
        void DeleteFile(string path);
        void CreateDirectory(string path);
        bool DirectoryExists(string path);
        IEnumerable<string> EnumerateFiles(string path);
    }
}
