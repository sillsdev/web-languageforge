using System;
using System.ComponentModel;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using SIL.XForge.WebApi.Server.Models;
using SIL.XForge.WebApi.Server.Options;

namespace SIL.XForge.WebApi.Server.Services
{
    public enum AssetType
    {
        Audio,
        Picture
    }

    public class AssetService
    {
        private readonly IOptions<AppOptions> _appOptions;

        public AssetService(IOptions<AppOptions> appOptions)
        {
            _appOptions = appOptions;
        }

        public async Task<string> SaveAssetAsync(Project project, IFormFile file, AssetType type)
        {
            string rootDir = _appOptions.Value.RootDir;
            string assetTypeDir;
            switch (type)
            {
                case AssetType.Audio:
                    assetTypeDir = "audio";
                    break;
                case AssetType.Picture:
                    assetTypeDir = "pictures";
                    break;
                default:
                    throw new InvalidEnumArgumentException(nameof(type), (int) type, typeof(AssetType));
            }
            string relativeAssetDir = Path.Combine(project.AssetsFolderPath, assetTypeDir);
            string assetDir = Path.Combine(rootDir, relativeAssetDir);
            if (!Directory.Exists(assetDir))
                Directory.CreateDirectory(assetDir);
            string filePrefix = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            string fileName = filePrefix + "_" + file.FileName;
            using (var stream = new FileStream(Path.Combine(assetDir, fileName), FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            return Path.Combine(relativeAssetDir, fileName);
        }
    }
}
