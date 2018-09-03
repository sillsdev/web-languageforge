using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using IdentityModel;
using IdentityServer4;
using IdentityServer4.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SIL.XForge.DataAccess;
using SIL.XForge.Identity.Services;

namespace SIL.XForge.Identity
{
    public static class IdentityExtensions
    {
        private static readonly List<IdentityResource> IdentityResources = new List<IdentityResource>
        {
            new IdentityResources.OpenId(),
            new IdentityResources.Email(),
            new IdentityResources.Profile()
        };

        private static readonly List<ApiResource> ApiResources = new List<ApiResource>
        {
            new ApiResource("api", "Web API")
            {
                UserClaims = { JwtClaimTypes.Role, "site_role" }
            }
        };

        private static Client SFClient(string host)
        {
            return new Client
            {
                ClientId = "SF",
                AllowedGrantTypes = GrantTypes.Implicit,
                AllowAccessTokensViaBrowser = true,
                AlwaysIncludeUserClaimsInIdToken = true,
                AccessTokenType = AccessTokenType.Jwt,
                RequireConsent = false,
                RedirectUris =
                {
                    $"https://{host}/home",
                    $"https://{host}/silent-refresh.html"
                },
                PostLogoutRedirectUris =
                {
                    $"https://{host}/"
                },
                AllowedScopes =
                {
                    IdentityServerConstants.StandardScopes.OpenId,
                    IdentityServerConstants.StandardScopes.Email,
                    IdentityServerConstants.StandardScopes.Profile,
                    "api"
                }
            };
        }

        public static IServiceCollection AddXForgeIdentityServer(this IServiceCollection services,
            IHostingEnvironment env, IConfiguration configuration)
        {
            IConfigurationSection dataAccessConfig = configuration.GetSection("DataAccess");
            string connectionString = dataAccessConfig.GetValue("ConnectionString",
                "mongodb://localhost:27017");

            IConfigurationSection securityConfig = configuration.GetSection("Security");
            string keyStore = securityConfig.GetValue("KeyStore", "/etc/apache2/ssl/");

            services.ConfigureOptions<StaticFilesConfigureOptions>();

            string host = null;
            string certFileNameBase = null;
            if (env.IsDevelopment())
            {
                host = "beta.scriptureforge.local";
                certFileNameBase = "scriptureforge_beta";
            }
            else if (env.IsStaging())
            {
                host = "beta.qa.scriptureforge.org";
                certFileNameBase = "scriptureforge_org_qa_beta";
            }
            else if (env.IsProduction())
            {
                host = "beta.scriptureforge.org";
                certFileNameBase = "scriptureforge_org_beta";
            }

            IIdentityServerBuilder builder = services.AddIdentityServer()
                .AddValidationKeys()
                .AddInMemoryIdentityResources(IdentityResources)
                .AddInMemoryApiResources(ApiResources)
                .AddInMemoryClients(new[] { SFClient(host) })
                .AddProfileService<UserProfileService>()
                .AddResourceOwnerValidator<UserResourceOwnerPasswordValidator>()
                .AddOperationalStore(options =>
                    {
                        options.ConnectionString = connectionString;
                        options.Database = DataAccessConstants.MongoDatabase;
                    });

            string certFileName = Path.Combine(keyStore, certFileNameBase + ".pem");
            byte[] certBuffer = GetBytesFromPEM(File.ReadAllText(certFileName), true);

            string keyFileName = Path.Combine(keyStore, certFileNameBase + ".key");
            byte[] keyBuffer = GetBytesFromPEM(File.ReadAllText(keyFileName), false);
            var rsa = RSA.Create();
            rsa.ImportParameters(DecodeRSAPrivateKey(keyBuffer));

            var cert = new X509Certificate2(certBuffer);
            cert = cert.CopyWithPrivateKey(rsa);
            builder.AddSigningCredential(cert);

            return services;
        }

        private static byte[] GetBytesFromPEM(string pemString, bool isCert)
        {
            string header;
            string footer;
            if (isCert)
            {
                header = "-----BEGIN CERTIFICATE-----";
                footer = "-----END CERTIFICATE-----";
            }
            else
            {
                header = "-----BEGIN RSA PRIVATE KEY-----";
                footer = "-----END RSA PRIVATE KEY-----";
            }

            int start = pemString.IndexOf(header) + header.Length;
            int end = pemString.IndexOf(footer, start) - start;
            return Convert.FromBase64String(pemString.Substring(start, end));
        }

        private static RSAParameters DecodeRSAPrivateKey(byte[] privateKeyInDER)
        {
            byte[] paramModulus;
            byte[] paramDP;
            byte[] paramDQ;
            byte[] paramIQ;
            byte[] paramE;
            byte[] paramD;
            byte[] paramP;
            byte[] paramQ;

            var memoryStream = new MemoryStream(privateKeyInDER);
            var binaryReader = new BinaryReader(memoryStream);

            ushort twobytes = 0;
            int elements = 0;
            byte bt = 0;

            try
            {
                twobytes = binaryReader.ReadUInt16();
                if (twobytes == 0x8130)
                    binaryReader.ReadByte();
                else if (twobytes == 0x8230)
                    binaryReader.ReadInt16();
                else
                    throw new CryptographicException("Wrong data");

                twobytes = binaryReader.ReadUInt16();
                if (twobytes != 0x0102)
                    throw new CryptographicException("Wrong data");

                bt = binaryReader.ReadByte();
                if (bt != 0x00)
                    throw new CryptographicException("Wrong data");

                elements = GetIntegerSize(binaryReader);
                paramModulus = binaryReader.ReadBytes(elements);

                elements = GetIntegerSize(binaryReader);
                paramE = binaryReader.ReadBytes(elements);

                elements = GetIntegerSize(binaryReader);
                paramD = binaryReader.ReadBytes(elements);

                elements = GetIntegerSize(binaryReader);
                paramP = binaryReader.ReadBytes(elements);

                elements = GetIntegerSize(binaryReader);
                paramQ = binaryReader.ReadBytes(elements);

                elements = GetIntegerSize(binaryReader);
                paramDP = binaryReader.ReadBytes(elements);

                elements = GetIntegerSize(binaryReader);
                paramDQ = binaryReader.ReadBytes(elements);

                elements = GetIntegerSize(binaryReader);
                paramIQ = binaryReader.ReadBytes(elements);

                EnsureLength(ref paramD, 256);
                EnsureLength(ref paramDP, 128);
                EnsureLength(ref paramDQ, 128);
                EnsureLength(ref paramE, 3);
                EnsureLength(ref paramIQ, 128);
                EnsureLength(ref paramModulus, 256);
                EnsureLength(ref paramP, 128);
                EnsureLength(ref paramQ, 128);

                var rsaParameters = new RSAParameters();
                rsaParameters.Modulus = paramModulus;
                rsaParameters.Exponent = paramE;
                rsaParameters.D = paramD;
                rsaParameters.P = paramP;
                rsaParameters.Q = paramQ;
                rsaParameters.DP = paramDP;
                rsaParameters.DQ = paramDQ;
                rsaParameters.InverseQ = paramIQ;

                return rsaParameters;
            }
            finally
            {
                binaryReader.Close();
            }
        }

        private static int GetIntegerSize(BinaryReader binary)
        {
            byte bt = 0;
            byte lowbyte = 0x00;
            byte highbyte = 0x00;
            int count = 0;

            bt = binary.ReadByte();

            if (bt != 0x02)
                return 0;

            bt = binary.ReadByte();

            if (bt == 0x81)
                count = binary.ReadByte();
            else if (bt == 0x82)
            {
                highbyte = binary.ReadByte();
                lowbyte = binary.ReadByte();
                byte[] modint = { lowbyte, highbyte, 0x00, 0x00 };
                count = BitConverter.ToInt32(modint, 0);
            }
            else
                count = bt;

            while (binary.ReadByte() == 0x00)
                count -= 1;

            binary.BaseStream.Seek(-1, SeekOrigin.Current);

            return count;
        }

        private static void EnsureLength(ref byte[] data, int desiredLength)
        {
            if (data == null || data.Length >= desiredLength)
                return;

            int zeros = desiredLength - data.Length;

            byte[] newData = new byte[desiredLength];
            Array.Copy(data, 0, newData, zeros, data.Length);

            data = newData;
        }

    }
}
