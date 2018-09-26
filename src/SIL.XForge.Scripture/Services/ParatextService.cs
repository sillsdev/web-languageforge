using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using SIL.WritingSystems;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;
using SIL.XForge.Scripture.Configuration;
using SIL.XForge.Scripture.Models;

namespace SIL.XForge.Scripture.Services
{
    public class ParatextService : IParatextService, IDisposable
    {
        private readonly IOptions<ParatextOptions> _options;
        private readonly IRepository<UserEntity> _users;
        private readonly IRepository<SFProjectEntity> _projects;
        private readonly HttpClientHandler _httpClientHandler;
        private readonly HttpClient _dataAccessClient;
        private readonly HttpClient _registryClient;

        public ParatextService(IHostingEnvironment env, IOptions<ParatextOptions> options,
            IRepository<UserEntity> users, IRepository<SFProjectEntity> projects)
        {
            _options = options;
            _users = users;
            _projects = projects;

            _httpClientHandler = new HttpClientHandler();
            _dataAccessClient = new HttpClient(_httpClientHandler);
            _registryClient = new HttpClient(_httpClientHandler);
            if (env.IsDevelopment())
            {
                _httpClientHandler.ServerCertificateCustomValidationCallback
                    = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator;
                _dataAccessClient.BaseAddress = new Uri("https://data-access-dev.paratext.org");
                _registryClient.BaseAddress = new Uri("https://registry-dev.paratext.org");
            }
            else
            {
               _dataAccessClient.BaseAddress = new Uri("https://data-access.paratext.org");
               _registryClient.BaseAddress = new Uri("https://registry.paratext.org");
            }
            _registryClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        public async Task<IReadOnlyList<ParatextProject>> GetProjectsAsync(UserEntity user)
        {
            string response = await CallApiAsync(_dataAccessClient, user, HttpMethod.Get, "projects");
            var repos = XElement.Parse(response);
            var repoIds = new HashSet<string>(repos.Elements("repo").Select(r => (string) r.Element("projid")));
            Dictionary<string, SFProjectEntity> existingProjects = (await _projects.Query()
                .Where(p => repoIds.Contains(p.ParatextId))
                .ToListAsync())
                .ToDictionary(p => p.ParatextId);
            response = await CallApiAsync(_registryClient, user, HttpMethod.Get, "projects");
            var projectArray = JArray.Parse(response);
            var projects = new List<ParatextProject>();
            foreach (JToken projectObj in projectArray)
            {
                JToken identificationObj = projectObj["identification_systemId"]
                    .FirstOrDefault(id => (string) id["type"] == "paratext");
                if (identificationObj == null)
                    continue;
                string paratextId = (string) identificationObj["text"];
                if (!repoIds.Contains(paratextId))
                    continue;

                string role = await GetProjectRoleAsync(user, paratextId);
                bool isConnectable;
                string projectId = null;
                if (existingProjects.TryGetValue(paratextId, out SFProjectEntity project))
                {
                    projectId = project.Id;
                    isConnectable = !project.Users.Any(u => u.UserRef == user.Id);
                }
                else if (role == SFProjectRoles.Administrator)
                {
                    isConnectable = true;
                }
                else
                {
                    isConnectable = false;
                }

                var langName = (string) projectObj["language_iso"];
                if (StandardSubtags.TryGetLanguageFromIso3Code(langName, out LanguageSubtag subtag))
                    langName = subtag.Name;

                projects.Add(new ParatextProject
                    {
                        ParatextId = paratextId,
                        Name = (string) identificationObj["fullname"],
                        LanguageTag = (string) projectObj["language_ldml"],
                        LanguageName = langName,
                        ProjectId = projectId,
                        IsConnectable = isConnectable
                    });
            }
            return projects;
        }

        public async Task<string> GetProjectRoleAsync(UserEntity user, string paratextId)
        {
            string response = await CallApiAsync(_registryClient, user, HttpMethod.Get,
                $"projects/{paratextId}/members/{user.ParatextId}");
            var memberObj = JObject.Parse(response);
            return (string) memberObj["role"];
        }

        public async Task<IReadOnlyList<string>> GetBooksAsync(UserEntity user, string projectId)
        {
            string response = await CallApiAsync(_dataAccessClient, user, HttpMethod.Get, $"books/{projectId}");
            var books = XElement.Parse(response);
            string[] bookIds = books.Elements("Book").Select(b => (string) b.Attribute("id")).ToArray();
            return bookIds;
        }

        public Task<string> GetBookTextAsync(UserEntity user, string projectId, string bookId)
        {
            return CallApiAsync(_dataAccessClient, user, HttpMethod.Get, $"text/{projectId}/{bookId}");
        }

        public Task<string> UpdateBookTextAsync(UserEntity user, string projectId, string bookId, string revision,
            string usxText)
        {
            return CallApiAsync(_dataAccessClient, user, HttpMethod.Post, $"text/{projectId}/{revision}/{bookId}",
                usxText);
        }

        private async Task RefreshAccessTokenAsync(UserEntity user)
        {
            var request = new HttpRequestMessage(HttpMethod.Post, "api8/token");

            ParatextOptions options = _options.Value;
            var requestObj = new JObject(
                new JProperty("grant_type", "refresh_token"),
                new JProperty("client_id", options.ClientId),
                new JProperty("client_secret", options.ClientSecret),
                new JProperty("refresh_token", user.ParatextTokens.RefreshToken));
            request.Content = new StringContent(requestObj.ToString(), Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _registryClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            string responseJson = await response.Content.ReadAsStringAsync();
            var responseObj = JObject.Parse(responseJson);
            user.ParatextTokens = new Tokens
            {
                AccessToken = (string) responseObj["access_token"],
                RefreshToken = (string) responseObj["refresh_token"]
            };
            await _users.UpdateAsync(user, b => b.Set(u => u.ParatextTokens, user.ParatextTokens));
        }

        private async Task<string> CallApiAsync(HttpClient client, UserEntity user, HttpMethod method,
            string url, string content = null)
        {
            if (user.ParatextTokens?.AccessToken == null)
                throw new SecurityException("The current user is not signed into Paratext.");

            bool expired = IsAccessTokenExpired(user);
            bool refreshed = false;
            while (!refreshed)
            {
                if (expired)
                {
                    await RefreshAccessTokenAsync(user);
                    refreshed = true;
                }

                var request = new HttpRequestMessage(method, $"api8/{url}");
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer",
                    user.ParatextTokens.AccessToken);
                if (content != null)
                    request.Content = new StringContent(content);
                HttpResponseMessage response = await client.SendAsync(request);
                if (response.IsSuccessStatusCode)
                {
                    return await response.Content.ReadAsStringAsync();
                }
                else if (response.StatusCode == HttpStatusCode.Unauthorized)
                {
                    expired = true;
                }
                else
                {
                    string error = await response.Content.ReadAsStringAsync();
                    throw new HttpRequestException(
                        $"HTTP Request error, Code: {response.StatusCode}, Content: {error}");
                }
            }

            throw new SecurityException("The current user's Paratext access token is invalid.");
        }

        private static bool IsAccessTokenExpired(UserEntity user)
        {
            var accessToken = new JwtSecurityToken(user.ParatextTokens.AccessToken);
            var now = DateTime.UtcNow;
            return now < accessToken.ValidFrom || now > accessToken.ValidTo;
        }

        #region IDisposable Support
        private bool _disposedValue; // To detect redundant calls

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposedValue)
            {
                if (disposing)
                {
                    _dataAccessClient.Dispose();
                    _registryClient.Dispose();
                    _httpClientHandler.Dispose();
                }

                _disposedValue = true;
            }
        }

        // This code added to correctly implement the disposable pattern.
        public void Dispose()
        {
            // Do not change this code. Put cleanup code in Dispose(bool disposing) above.
            Dispose(true);
        }
        #endregion
    }
}
