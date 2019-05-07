using Newtonsoft.Json.Linq;
using ShareDB.RichText;

namespace SIL.XForge.Scripture.Services
{
    public static class DeltaUsxExtensions
    {
        public static Delta InsertPara(this Delta delta, JObject attributes)
        {
            var attrs = new JObject(new JProperty("para", attributes));
            return delta.Insert("\n", attrs);
        }

        public static Delta InsertText(this Delta delta, string text, string segRef = null, JObject attributes = null)
        {
            if (segRef != null)
            {
                attributes = (JObject)attributes?.DeepClone() ?? new JObject();
                attributes.Add(new JProperty("segment", segRef));
            }
            return delta.Insert(text, attributes);
        }

        public static Delta InsertBlank(this Delta delta, string segRef)
        {
            string type = segRef.Contains("/p") || segRef.Contains("/m") ? "initial" : "normal";

            var attrs = new JObject(new JProperty("segment", segRef));
            return delta.Insert(new { blank = type }, attrs);
        }

        public static Delta InsertEmbed(this Delta delta, string type, JObject obj, string segRef = null,
            JObject attributes = null)
        {
            var embed = new JObject(new JProperty(type, obj));

            if (segRef != null)
            {
                attributes = (JObject)attributes?.DeepClone() ?? new JObject();
                attributes.Add(new JProperty("segment", segRef));
            }

            return delta.Insert(embed, attributes);
        }
    }
}
