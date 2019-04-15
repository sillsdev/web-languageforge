using System.Collections.Generic;
using System.IO;

namespace SIL.XForge.Services
{
    public class FileSystemService : IFileSystemService
    {
        public Stream CreateFile(string path)
        {
            return File.Create(path);
        }

        public bool FileExists(string path)
        {
            return File.Exists(path);
        }

        public Stream OpenFile(string path, FileMode mode)
        {
            return File.Open(path, mode);
        }

        public void DeleteFile(string path)
        {
            File.Delete(path);
        }

        public void CreateDirectory(string path)
        {
            Directory.CreateDirectory(path);
        }

        public bool DirectoryExists(string path)
        {
            return Directory.Exists(path);
        }

        public IEnumerable<string> EnumerateFiles(string path)
        {
            return Directory.EnumerateFiles(path);
        }
    }
}
