using System;
using System.Collections.Generic;
using System.Linq;
using SIL.Extensions;
using SIL.Text;

namespace SIL.WritingSystems
{
	/// <summary>
	/// Lets you find a language using data from the Ethnologue and the SLDR.
	/// </summary>
	public class LanguageLookup
	{
		private readonly Dictionary<string, LanguageInfo> _codeToLanguageIndex = new Dictionary<string, LanguageInfo>();
		private readonly Dictionary<string, List<LanguageInfo>> _nameToLanguageIndex = new Dictionary<string, List<LanguageInfo>>();

		/// <summary>
		/// Initializes a new instance of the <see cref="LanguageLookup"/> class.
		/// </summary>
		public LanguageLookup()
		{
			var threeToTwoLetter = new Dictionary<string, string>();
			foreach (string line in LanguageRegistryResources.TwoToThreeCodes.Replace("\r\n", "\n").Split(new[] { "\n" }, StringSplitOptions.RemoveEmptyEntries))
			{
				string[] items = line.Split('\t');
				threeToTwoLetter.Add(items[1].Trim(), items[0].Trim());
			}

			//LanguageIndex.txt Format: LangID	CountryID	NameType	Name
			//a language appears on one row for each of its alternative langauges
			var entries = new List<string>(LanguageRegistryResources.LanguageIndex.Split(new[] { "\n" }, StringSplitOptions.RemoveEmptyEntries));
			entries.Add("qaa\t?\tL\tUnlisted Language");
			foreach (string entry in entries.Skip(1)) //skip the header
			{
				string[] items = entry.Split('\t');
				if (items.Length != 4)
					continue;
				if(items[2].Contains('!')) //temporary suppression of entries while waiting for Ethnologue changes
					continue;

				string code = items[0].Trim();
				string twoLetterCode;
				if (threeToTwoLetter.TryGetValue(code, out twoLetterCode))
					code = twoLetterCode;

				string regionCode = items[1].Trim();
				LanguageInfo language = GetOrCreateLanguageFromCode(code, regionCode == "?" ? "?" : StandardSubtags.RegisteredRegions[regionCode].Name);

				string name = items[3].Trim();

				
				if (items[2] == "L")
				{
					while (language.Names.Contains(name))
						language.Names.Remove(name);
					language.Names.Insert(0, name);
				}
				else
				{
					if (items[2].Contains("P"))
					{
						//Skip pejorative
					}
					else if (items[1] == ("ET"))
					{
						//Skip alternatives for Ethiopia, as per request
					}
					else if (items[0] == "gax" || items[0] == "om")
					{
						//For these two "Oromo" languages, skip all related languages as per request
					}
					else if (!language.Names.Contains(name))
						language.Names.Add(name); //intentionally not lower-casing
				}
			}

			IEnumerable<IGrouping<string, string>> languageGroups = Sldr.LanguageTags.Where(info => info.IsAvailable && IetfLanguageTag.IsValid(info.LanguageTag))
				.Select(info => IetfLanguageTag.Canonicalize(info.LanguageTag))
				.GroupBy(IetfLanguageTag.GetLanguagePart);

			foreach (IGrouping<string, string> languageGroup in languageGroups)
			{
				string[] langTags = languageGroup.ToArray();
				if (langTags.Length == 1)
				{
					string langTag = langTags[0];
					LanguageInfo language;
					if (langTag != languageGroup.Key && _codeToLanguageIndex.TryGetValue(languageGroup.Key, out language))
					{
						_codeToLanguageIndex.Remove(languageGroup.Key);
						language.LanguageTag = langTag;
						_codeToLanguageIndex[langTag] = language;
					}
				}
				else
				{
					foreach (string langTag in langTags)
					{
						LanguageSubtag languageSubtag;
						ScriptSubtag scriptSubtag;
						RegionSubtag regionSubtag;
						IEnumerable<VariantSubtag> variantSubtags;
						if (IetfLanguageTag.TryGetSubtags(langTag, out languageSubtag, out scriptSubtag, out regionSubtag, out variantSubtags))
						{
							if (langTag == languageSubtag)
								continue;

							LanguageInfo language = GetOrCreateLanguageFromCode(langTag, regionSubtag == null ? "?" : regionSubtag.Name);
							bool displayScript = scriptSubtag != null && !IetfLanguageTag.IsScriptImplied(langTag);
							LanguageInfo otherLanguage;
							if (langTag != languageSubtag && !displayScript && _codeToLanguageIndex.TryGetValue(languageSubtag, out otherLanguage) && language.Countries.SetEquals(otherLanguage.Countries))
							{
								language.Names.AddRange(otherLanguage.Names);
							}
							else
							{
								string name = displayScript ? string.Format("{0} ({1})", languageSubtag.Name, scriptSubtag.Name) : languageSubtag.Name;
								if (!language.Names.Contains(name))
									language.Names.Add(name); //intentionally not lower-casing
							}
						}
					}
				}
			}

			foreach (LanguageInfo languageInfo in _codeToLanguageIndex.Values)
			{
				foreach (string name in languageInfo.Names)
					GetOrCreateListFromName(name).Add(languageInfo);

				if (languageInfo.Names.Count == 0)
					continue; // this language is suppressed

				//Why just this small set? Only out of convenience. Ideally we'd have a db of all languages as they write it in their literature.
				string localName = null;
				switch (languageInfo.Names[0])
				{
					case "French":
						localName = "français";
						break;
					case "Spanish":
						localName = "español";
						break;
					case "Chinese":
						localName = "中文";
						break;
					case "Hindi":
						localName = "हिन्दी";
						break;
					case "Bengali":
						localName = "বাংলা";
						break;
					case "Telugu":
						localName = "తెలుగు";
						break;
					case "Tamil":
						localName = "தமிழ்";
						break;
					case "Urdu":
						localName = "اُردُو";
						break;
					case "Arabic":
						localName = "العربية/عربي";
						break;
					case "Thai":
						localName = "ภาษาไทย";
						break;
					case "Indonesian":
						localName = "Bahasa Indonesia";
						break;
				}
				if (!string.IsNullOrEmpty(localName))
				{
					if (!languageInfo.Names.Remove(localName))
						GetOrCreateListFromName(localName).Add(languageInfo);
					languageInfo.Names.Insert(0, localName);
				}
			}
		}

		private List<LanguageInfo> GetOrCreateListFromName(string name)
		{
			List<LanguageInfo> languages;
			if (!_nameToLanguageIndex.TryGetValue(name, out languages))
			{
				languages = new List<LanguageInfo>();
				_nameToLanguageIndex.Add(name, languages);
			}
			return languages;
		}

		private LanguageInfo GetOrCreateLanguageFromCode(string code, string countryName)
		{
			LanguageInfo language;
			if (!_codeToLanguageIndex.TryGetValue(code, out language))
			{
				language = new LanguageInfo {LanguageTag = code};
				_codeToLanguageIndex.Add(code, language);
			}
			if (!string.IsNullOrEmpty(countryName))
				language.Countries.Add(countryName);
			return language;
		}

		/// <summary>
		/// Get an list of languages that match the given string in some way (code, name, country)
		/// </summary>
		public IEnumerable<LanguageInfo> SuggestLanguages(string searchString)
		{
			if (searchString != null)
				searchString = searchString.Trim();
			if (string.IsNullOrEmpty(searchString))
				yield break;

			if (searchString == "*")
			{
				foreach (LanguageInfo l in _codeToLanguageIndex.Select(l => l.Value).OrderBy(l => l, new ResultComparer(searchString)))
					yield return l;
			}
			else
			{
				IEnumerable<LanguageInfo> matchOnCode = from x in _codeToLanguageIndex where x.Key.StartsWith(searchString, StringComparison.InvariantCultureIgnoreCase) select x.Value;
				List<LanguageInfo>[] matchOnName = (from x in _nameToLanguageIndex where x.Key.StartsWith(searchString, StringComparison.InvariantCultureIgnoreCase) select x.Value).ToArray();

				if (!matchOnName.Any())
				{
					// look  for approximate matches
					const int kMaxEditDistance = 3;
					var itemFormExtractor = new ApproximateMatcher.GetStringDelegate<KeyValuePair<string, List<LanguageInfo>>>(pair => pair.Key);
					IList<KeyValuePair<string, List<LanguageInfo>>> matches = ApproximateMatcher.FindClosestForms(_nameToLanguageIndex, itemFormExtractor,
						searchString,
						ApproximateMatcherOptions.None,
						kMaxEditDistance);
					matchOnName = (from m in matches select m.Value).ToArray();
				}

				var combined = new HashSet<LanguageInfo>(matchOnCode);
				foreach (List<LanguageInfo> l in matchOnName)
					combined.UnionWith(l);

				foreach (LanguageInfo languageInfo in combined.OrderBy(l => l, new ResultComparer(searchString)))
					yield return languageInfo;
			}
		}

		private class ResultComparer : IComparer<LanguageInfo>
		{
			private readonly string _searchString;

			public ResultComparer(string searchString)
			{
				_searchString = searchString;
			}

			public int Compare(LanguageInfo x, LanguageInfo y)
			{
				if (x.LanguageTag == y.LanguageTag)
					return 0;
				if (!x.Names[0].Equals(y.Names[0], StringComparison.InvariantCultureIgnoreCase))
				{
					// Favor ones where some language matches to solve BL-1141
					if (x.Names[0].Equals(_searchString, StringComparison.InvariantCultureIgnoreCase))
						return -1;
					if (y.Names[0].Equals(_searchString, StringComparison.InvariantCultureIgnoreCase))
						return 1;
					if (x.Names.Count > 1 && x.Names[1].Equals(_searchString, StringComparison.InvariantCultureIgnoreCase))
						return -1;
					if (y.Names.Count > 1 && y.Names[1].Equals(_searchString, StringComparison.InvariantCultureIgnoreCase))
						return 1;
				}

				if (x.LanguageTag.Equals(_searchString, StringComparison.InvariantCultureIgnoreCase))
					return -1;
				if (y.LanguageTag.Equals(_searchString, StringComparison.InvariantCultureIgnoreCase))
					return 1;

				if (IetfLanguageTag.GetLanguagePart(x.LanguageTag).Equals(_searchString, StringComparison.InvariantCultureIgnoreCase))
					return -1;
				if (IetfLanguageTag.GetLanguagePart(y.LanguageTag).Equals(_searchString, StringComparison.InvariantCultureIgnoreCase))
					return 1;

				int res = string.Compare(x.Names[0], y.Names[0], StringComparison.InvariantCultureIgnoreCase);
				if (res != 0)
					return res;

				return string.Compare(x.LanguageTag, y.LanguageTag, StringComparison.InvariantCultureIgnoreCase);
			}
		}
	}
}
