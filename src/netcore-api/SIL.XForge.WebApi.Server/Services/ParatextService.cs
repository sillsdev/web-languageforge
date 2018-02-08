using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using SIL.XForge.WebApi.Server.DataAccess;
using SIL.XForge.WebApi.Server.Models;
using SIL.XForge.WebApi.Server.Options;
using SIL.XForge.WebApi.Server.Utils;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;
using System.Net;

namespace SIL.XForge.WebApi.Server.Services
{
    public class ParatextService : IDisposable
    {
        private readonly IOptions<ParatextOptions> _options;
        private readonly IRepository<User> _userRepo;
        private readonly HttpClient _dataAccessClient;
        private readonly HttpClient _registryClient;

        public ParatextService(IOptions<ParatextOptions> options, IRepository<User> userRepo)
        {
            _options = options;
            _userRepo = userRepo;

            _dataAccessClient = new HttpClient
            {
                BaseAddress = new Uri("https://data-access-dev.paratext.org"),
            };

            _registryClient = new HttpClient
            {
                BaseAddress = new Uri("https://registry-dev.paratext.org"),
            };
            _registryClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        public async Task<Attempt<ParatextUserInfo>> TryGetUserInfoAsync(User user)
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

                        projects.Add(new ParatextProject
                            {
                                Id = projectId,
                                Name = (string) identificationObj["fullname"],
                                LanguageTag = (string) projectObj["language_ldml"],
                                // TODO: use SIL.WritingSystems to get language name from ISO-3 code
                                LanguageName = (string) projectObj["language_iso"]
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

        public async Task<Attempt<IReadOnlyList<string>>> TryGetBooksAsync(User user, string projectId)
        {
            if ((await TryCallApiAsync(_dataAccessClient, user, HttpMethod.Get, $"books/{projectId}"))
                .TryResult(out string response))
            {
                var books = XElement.Parse(response);
                string[] bookIds = books.Elements("Book").Select(b => (string) b.Attribute("id")).ToArray();
                return Attempt.Success<IReadOnlyList<string>>(bookIds);
            }
            return Attempt<IReadOnlyList<string>>.Failure;
        }

        public Task<Attempt<string>> TryGetBookTextAsync(User user, string projectId, string bookId)
        {
            return TryCallApiAsync(_dataAccessClient, user, HttpMethod.Get, $"text/{projectId}/{bookId}");
        }

        public Task<Attempt<string>> TryUpdateBookTextAsync(User user, string projectId, string bookId, string revision,
            string usxText)
        {
            return TryCallApiAsync(_dataAccessClient, user, HttpMethod.Post, $"text/{projectId}/{revision}/{bookId}",
                usxText);
        }

        private string GetUsername(User user)
        {
            var idToken = new JwtSecurityToken(user.ParatextAccessToken.IdToken);
            Claim usernameClaim = idToken.Claims.FirstOrDefault(c => c.Type == "username");
            return usernameClaim?.Value;
        }

        private async Task<bool> RefreshAccessTokenAsync(User user)
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
            if (!response.IsSuccessStatusCode)
                return false;

            string responseJson = await response.Content.ReadAsStringAsync();
            var responseObj = JObject.Parse(responseJson);
            user.ParatextAccessToken = new AccessTokenInfo
            {
                IdToken = (string) responseObj["id_token"],
                AccessToken = (string) responseObj["access_token"],
                RefreshToken = (string) responseObj["refresh_token"]
            };
            await _userRepo.UpdateAsync(user, b => b.Set(u => u.ParatextAccessToken, user.ParatextAccessToken));
            return true;
        }

        private async Task<Attempt<string>> TryCallApiAsync(HttpClient client, User user, HttpMethod method, string url,
            string content = null)
        {
            if (user.ParatextAccessToken?.AccessToken == null)
                return Attempt<string>.Failure;

            bool expired = IsAccessTokenExpired(user);
            bool refreshed = false;
            while (!refreshed)
            {
                if (expired)
                {
                    if (!await RefreshAccessTokenAsync(user))
                        return Attempt<string>.Failure;
                    refreshed = true;
                }

                var request = new HttpRequestMessage(method, $"api8/{url}");
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer",
                    user.ParatextAccessToken.AccessToken);
                if (content != null)
                    request.Content = new StringContent(content);
                HttpResponseMessage response = await client.SendAsync(request);
                if (response.IsSuccessStatusCode)
                {
                    return Attempt.Success(await response.Content.ReadAsStringAsync());
                }
                else if (response.StatusCode == HttpStatusCode.Unauthorized)
                {
                    expired = true;
                }
                else
                {
                    return Attempt.Failure(await response.Content.ReadAsStringAsync());
                }
            }

            return Attempt<string>.Failure;
        }

        private static bool IsAccessTokenExpired(User user)
        {
            var accessToken = new JwtSecurityToken(user.ParatextAccessToken.AccessToken);
            var now = DateTime.UtcNow;
            return now < accessToken.ValidFrom || now > accessToken.ValidTo;
        }

        #region IDisposable Support
        private bool disposedValue = false; // To detect redundant calls

        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                    _dataAccessClient.Dispose();
                    _registryClient.Dispose();
                }

                disposedValue = true;
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
