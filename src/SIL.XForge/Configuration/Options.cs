namespace SIL.XForge.Configuration
{
    public static class Options
    {
        public static string GetSectionName<T>()
        {
            string sectionName = typeof(T).Name;
            if (sectionName.EndsWith("Options"))
                sectionName = sectionName.Substring(0, sectionName.Length - "Options".Length);
            return sectionName;
        }
    }
}
