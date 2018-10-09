using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.CSharp.RuntimeBinder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Primitives;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using SIL.XForge.Identity.Configuration;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Net.Http;
using System.Threading.Tasks;

namespace SIL.XForge.Identity.Controllers.Account
{
    public class ValidateRecaptchaFilter : IAsyncActionFilter
    {
        private readonly GoogleCaptchaOptions captcha;
        private const string verificationUrl = "https://www.google.com/recaptcha/api/siteverify";
        public string ErrorMessage { get; set; } = "Please select and validate the captcha.";
        public ValidateRecaptchaFilter(IOptions<GoogleCaptchaOptions> captcha)
        {
            this.captcha = captcha.Value;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            if(context.HttpContext.Request.Method != HttpMethod.Post.ToString())
            {
                //ValidateRecaptchaAttribute must only decorate POST actions.");
                return;
            }

            StringValues recaptchaResponse;
            try
            {
                recaptchaResponse = context.HttpContext.Request.Form["g-recaptcha-response"];
            }
            catch (InvalidOperationException){}


            using (var client = new HttpClient())
            {
                try
                {
                    var siteSecret = captcha.CaptchaSecret;
                    var values = new Dictionary<string, string>
                    {
                        { "secret", siteSecret },
                        { "response", recaptchaResponse },
                        { "remoteip", GetRemoteIp(context) }
                    };
                    var content = new FormUrlEncodedContent(values);

                    HttpResponseMessage response;
                    response = await client.PostAsync(verificationUrl, content);


                    var responseString = await response.Content.ReadAsStringAsync();

                    var converter = new ExpandoObjectConverter();

                    dynamic obj = JsonConvert.DeserializeObject<ExpandoObject>(responseString, converter);
                    bool isHuman = obj.success;

                    if (!isHuman)
                    {
                        context.ModelState.AddModelError("reCAPTCHAFailure", ErrorMessage);
                    }
                }
                catch (RuntimeBinderException) { }
            }

            await next();
        }
        private string GetRemoteIp(ActionExecutingContext context)
        {
            string ip = context.HttpContext.Request.Headers["HTTP_X_FORWARDED_FOR"];

            if (String.IsNullOrEmpty(ip))
            {
                ip = context.HttpContext.Request.Headers["REMOTE_ADDR"];
            }

            return ip;
        }
    }
}
