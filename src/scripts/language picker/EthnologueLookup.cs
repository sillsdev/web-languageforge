using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Palaso.WritingSystems
{
	/// <summary>
	/// Lets you find a language using data from the Ethnologue. Currently doesn't do any live-lookup, just reads files stored in the LanguageRegistryResources
	/// </summary>
	public class EthnologueLookup
	{
		Dictionary<string, string> CountryCodeToCountryName = new Dictionary<string, string>();
		Dictionary<string, LanguageInfo> CodeToLanguageIndex = new Dictionary<string, LanguageInfo>();
		Dictionary<string, List<LanguageInfo>> NameToLanguageIndex = new Dictionary<string, List<LanguageInfo>>();
		Dictionary<string,string> ThreeToTwoLetter = new Dictionary<string, string>();

		public EthnologueLookup()
		{
			foreach (var line in LanguageRegistryResources.TwoToThreeCodes.Split(new[] { "\n" }, StringSplitOptions.RemoveEmptyEntries))
			{
				var items = line.Split('\t');
				ThreeToTwoLetter.Add(items[1].Trim(), items[0].Trim());
			}


			foreach (var line in LanguageRegistryResources.CountryCodes.Split(new[] { "\n" }, StringSplitOptions.RemoveEmptyEntries))
			{
				var items = line.Split('\t');//id name area
				CountryCodeToCountryName.Add(items[0].Trim(),items[1].Trim());
			}


			//LanguageIndex.txt Format: LangID	CountryID	NameType	Name
			//a language appears on one row for each of its alternative langauges
			string[] entries = LanguageRegistryResources.LanguageIndex.Split(new[] { "\n" }, StringSplitOptions.RemoveEmptyEntries);
			foreach (string entry in entries.Skip(1))//skip the header
			{
				var items = entry.Split('\t');
				if (items.Length != 4)
					continue;
				var code = items[0].Trim();
				string TwoLetterCode;
				if (ThreeToTwoLetter.TryGetValue(code, out TwoLetterCode))
					code = TwoLetterCode;

				LanguageInfo language = GetOrCreateLanguageFromCode(code, items[1].Trim());

				var name = items[3].Trim();
				if (items[2] == "L")
				{
					while (language.Names.Contains(name))
						language.Names.Remove(name);
					language.Names.Insert(0,name);
				}
				else
				{
					if(!language.Names.Contains(name))
						language.Names.Add(name);//intentionally not lower-casing
				}
			}

			foreach (var languageInfo in CodeToLanguageIndex.Values)
			{
				foreach (var name in languageInfo.Names)
				{
					GetOrCreateListFromName(name).Add(languageInfo);
				}
			}
		}

		private List<LanguageInfo> GetOrCreateListFromName(string name)
		{
			List<LanguageInfo> languages;
			if (!NameToLanguageIndex.TryGetValue(name, out languages))
			{
				languages = new List<LanguageInfo>();
				NameToLanguageIndex.Add(name, languages);
			}
			return languages;
		}

		private LanguageInfo GetOrCreateLanguageFromCode(string code, string country)
		{
			LanguageInfo language;
			var countryName = CountryCodeToCountryName[country];
			if (!CodeToLanguageIndex.TryGetValue(code, out language))
			{
				language = new LanguageInfo() { Code = code, Country = countryName };
				CodeToLanguageIndex.Add(code,language);
			}
			else
			{
				if(!language.Country.Contains(countryName))
				{
					language.Country += ", " + countryName;
				}
			}
			return language;
		}

		/// <summary>
		/// Get an list of languages that match the given string in some way (code, name, country)
		/// </summary>
		public IEnumerable<LanguageInfo> SuggestLanguages(string searchString)
		{
			if (searchString != null)
				searchString = searchString.Trim().ToLowerInvariant();
			if (string.IsNullOrEmpty(searchString))
			{
				yield break;
			}
			else if(searchString =="*")
			{
				foreach (var l in from x in CodeToLanguageIndex select x.Value)
					yield return l;
			}
			else
			{
				IEnumerable<LanguageInfo> matchOnCode = from x in CodeToLanguageIndex where x.Key.ToLowerInvariant().StartsWith(searchString) select x.Value;
				var matchOnName = from x in NameToLanguageIndex where x.Key.ToLowerInvariant().StartsWith(searchString) select x.Value;
				List<LanguageInfo> combined = new List<LanguageInfo>(matchOnCode);
				foreach (var l in matchOnName)
				{
					combined.AddRange(l);
				}
				List<LanguageInfo> sorted = new List<LanguageInfo>(combined.Distinct());
				sorted.Sort(new ResultComparer(searchString));
				foreach (var languageInfo in sorted)
				{
					yield return languageInfo;
				}
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
				if (x.Code == y.Code)
					return 0;
				if (x.Code == _searchString || x.Names[0].ToLowerInvariant()==_searchString)
				{
					return -1;
				}
				if (y.Code == _searchString || y.Names[0].ToLowerInvariant() == _searchString)
				{
					return 1;
				}
//enhance we could favor ones where some language matches
				return 0;
			}
		}
	}

	public class LanguageInfo
	{
		public List<string> Names=new List<string>();
		public string Country;
		public string Code;
	}
}
