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

namespace SIL.XForge.WebApi.Server.Services
{
    public class ParatextService : IDisposable
    {
        private readonly ParatextOptions _options;
        private readonly IRepository<User> _userRepo;
        private readonly HttpClient _dataAccessClient;
        private readonly HttpClient _registryClient;

        public ParatextService(IOptions<ParatextOptions> options, IRepository<User> userRepo)
        {
            _options = options.Value;
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

        public Task<Attempt<ParatextUserInfo>> TryGetUserInfo(User user)
        {
            return CallApiAsync(user, async () =>
                {
                    if ((await TryGetProjectsAsync(user)).TryResult(out IReadOnlyList<ParatextProject> projects))
                    {
                        return Attempt.Success(new ParatextUserInfo
                        {
                            Username = GetUsername(user),
                            Projects = projects
                        });
                    }
                    return Attempt<ParatextUserInfo>.Failure;
                });
        }

        private string GetUsername(User user)
        {
            var idToken = new JwtSecurityToken(user.ParatextAccessToken.IdToken);
            Claim usernameClaim = idToken.Claims.FirstOrDefault(c => c.Type == "username");
            return usernameClaim?.Value;
        }

        private async Task<Attempt<IReadOnlyList<ParatextProject>>> TryGetProjectsAsync(User user)
        {
            var request = new HttpRequestMessage(HttpMethod.Get, "api8/projects");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer",
                user.ParatextAccessToken.AccessToken);
            HttpResponseMessage response = await _registryClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
                return Attempt<IReadOnlyList<ParatextProject>>.Failure;
            string responseJson = await response.Content.ReadAsStringAsync();
            var projects = JArray.Parse(responseJson);
            return new Attempt<IReadOnlyList<ParatextProject>>(projects.Select(GetProjectInfo).ToArray());
        }

        private static ParatextProject GetProjectInfo(JToken project)
        {
            JToken identification = project["identification_systemId"]
                .FirstOrDefault(id => (string) id["type"] == "paratext");
            return new ParatextProject
            {
                Id = (string) identification["text"],
                Name = (string) identification["fullname"]
            };
        }

        private async Task<Attempt<User>> RefreshAccessTokenAsync(User user)
        {
            var request = new HttpRequestMessage(HttpMethod.Post, "api8/token");

            var requestObj = new JObject(
                new JProperty("grant_type", "refresh_token"),
                new JProperty("client_id", _options.ClientId),
                new JProperty("client_secret", _options.ClientSecret),
                new JProperty("refresh_token", user.ParatextAccessToken.RefreshToken));
            request.Content = new StringContent(requestObj.ToString(), Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _registryClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
                return Attempt.Failure(user);

            string responseJson = await response.Content.ReadAsStringAsync();
            var responseObj = JObject.Parse(responseJson);
            var accessTokenInfo = new AccessTokenInfo
            {
                IdToken = (string) responseObj["id_token"],
                AccessToken = (string) responseObj["access_token"],
                RefreshToken = (string) responseObj["refresh_token"]
            };
            user = await _userRepo.UpdateAsync(user, b => b.Set(u => u.ParatextAccessToken, accessTokenInfo));
            return Attempt.Success(user);
        }

        private async Task<Attempt<T>> CallApiAsync<T>(User user, Func<Task<Attempt<T>>> call)
        {
            if (user.ParatextAccessToken?.AccessToken == null)
                return Attempt<T>.Failure;

            bool expired = IsAccessTokenExpired(user);
            bool refreshed = false;
            while (!refreshed)
            {
                if (expired)
                {
                    if (!(await RefreshAccessTokenAsync(user)).TryResult(out user))
                        return Attempt<T>.Failure;
                    refreshed = true;
                }

                Attempt<T> attempt = await call();
                if (attempt.Success)
                    return attempt;

                // assume that the token has expired if the call didn't succeed
                expired = true;
            }

            return Attempt<T>.Failure;
        }

        private bool IsAccessTokenExpired(User user)
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
