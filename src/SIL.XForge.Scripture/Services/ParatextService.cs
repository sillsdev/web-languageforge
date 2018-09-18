using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Claims;
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
using SIL.XForge.Utils;

namespace SIL.XForge.Scripture.Services
{
    public class ParatextService : IDisposable
    {
        private readonly IOptions<ParatextOptions> _options;
        private readonly IRepository<UserEntity> _userRepo;
        private readonly HttpClientHandler _httpClientHandler;
        private readonly HttpClient _dataAccessClient;
        private readonly HttpClient _registryClient;

        public ParatextService(IHostingEnvironment env, IOptions<ParatextOptions> options,
            IRepository<UserEntity> userRepo)
        {
            _options = options;
            _userRepo = userRepo;

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

        public async Task<Attempt<ParatextUserInfo>> TryGetUserInfoAsync(UserEntity user)
        {
            if ((await TryCallApiAsync(_dataAccessClient, user, HttpMethod.Get, "projects"))
                .TryResult(out string response))
            {
                var repos = XElement.Parse(response);
                var repoIds = new HashSet<string>(repos.Elements("repo").Select(r => (string) r.Element("projid")));
                if ((await TryCallApiAsync(_registryClient, user, HttpMethod.Get, "projects"))
                    .TryResult(out response))
                {
                    var projectArray = JArray.Parse(response);
                    var projects = new List<ParatextProject>();
                    foreach (JToken projectObj in projectArray)
                    {
                        JToken identificationObj = projectObj["identification_systemId"]
                            .FirstOrDefault(id => (string) id["type"] == "paratext");
                        if (identificationObj == null)
                            continue;
                        string projectId = (string) identificationObj["text"];
                        if (!repoIds.Contains(projectId))
                            continue;

                        var langName = (string) projectObj["language_iso"];
                        if (StandardSubtags.TryGetLanguageFromIso3Code(langName, out LanguageSubtag subtag))
                            langName = subtag.Name;

                        projects.Add(new ParatextProject
                            {
                                Id = projectId,
                                Name = (string) identificationObj["fullname"],
                                LanguageTag = (string) projectObj["language_ldml"],
                                LanguageName = langName
                            });
                    }
                    return Attempt.Success(new ParatextUserInfo
                        {
                            Username = GetUsername(user),
                            Projects = projects
                        });
                }
            }
            return Attempt<ParatextUserInfo>.Failure;
        }

        public async Task<IReadOnlyList<string>> GetBooksAsync(UserEntity user, string projectId)
        {
            if ((await TryCallApiAsync(_dataAccessClient, user, HttpMethod.Get, $"books/{projectId}"))
                .TryResult(out string response))
            {
                var books = XElement.Parse(response);
                string[] bookIds = books.Elements("Book").Select(b => (string) b.Attribute("id")).ToArray();
                return bookIds;
            }
            throw new InvalidOperationException("The user's access token is invalid.");
        }

        public async Task<string> GetBookTextAsync(UserEntity user, string projectId, string bookId)
        {
            if ((await TryCallApiAsync(_dataAccessClient, user, HttpMethod.Get, $"text/{projectId}/{bookId}"))
                .TryResult(out string response))
            {
                return response;
            }
            throw new InvalidOperationException("The user's access token is invalid.");
        }

        public async Task<string> UpdateBookTextAsync(UserEntity user, string projectId, string bookId, string revision,
            string usxText)
        {
            if ((await TryCallApiAsync(_dataAccessClient, user, HttpMethod.Post,
                $"text/{projectId}/{revision}/{bookId}", usxText)).TryResult(out string response))
            {
                return response;
            }
            throw new InvalidOperationException("The user's access token is invalid.");
        }

        private string GetUsername(UserEntity user)
        {
            var idToken = new JwtSecurityToken(user.ParatextAccessToken.IdToken);
            Claim usernameClaim = idToken.Claims.FirstOrDefault(c => c.Type == "username");
            return usernameClaim?.Value;
        }

        private async Task RefreshAccessTokenAsync(UserEntity user)
        {
            var request = new HttpRequestMessage(HttpMethod.Post, "api8/token");

            ParatextOptions options = _options.Value;
            var requestObj = new JObject(
                new JProperty("grant_type", "refresh_token"),
                new JProperty("client_id", options.ClientId),
                new JProperty("client_secret", options.ClientSecret),
                new JProperty("refresh_token", user.ParatextAccessToken.RefreshToken));
            request.Content = new StringContent(requestObj.ToString(), Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _registryClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            string responseJson = await response.Content.ReadAsStringAsync();
            var responseObj = JObject.Parse(responseJson);
            user.ParatextAccessToken = new AccessTokenInfo
            {
                IdToken = (string) responseObj["id_token"],
                AccessToken = (string) responseObj["access_token"],
                RefreshToken = (string) responseObj["refresh_token"]
            };
            await _userRepo.UpdateAsync(user, b => b.Set(u => u.ParatextAccessToken, user.ParatextAccessToken));
        }

        private async Task<Attempt<string>> TryCallApiAsync(HttpClient client, UserEntity user, HttpMethod method,
            string url, string content = null)
        {
            if (user.ParatextAccessToken?.AccessToken == null)
                return Attempt<string>.Failure;

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
                    user.ParatextAccessToken.AccessToken);
                if (content != null)
                    request.Content = new StringContent(content);
                HttpResponseMessage response = await client.SendAsync(request);
                if (response.IsSuccessStatusCode)
                    return Attempt.Success(await response.Content.ReadAsStringAsync());
                else if (response.StatusCode == HttpStatusCode.Unauthorized)
                    expired = true;
                else
                    response.EnsureSuccessStatusCode();
            }

            return Attempt<string>.Failure;
        }

        private static bool IsAccessTokenExpired(UserEntity user)
        {
            var accessToken = new JwtSecurityToken(user.ParatextAccessToken.AccessToken);
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
