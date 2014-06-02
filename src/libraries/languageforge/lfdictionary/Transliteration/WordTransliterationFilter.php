<?php
namespace libraries\lfdictionary\Transliteration;
use libraries\lfdictionary\common\LoggerFactory;

// TODO Delete. The typeahead can be reimplemented in a relevant command / dto using lv distance etc. This is used in the MongoLexStore::searchEntriesAsWordList, essentially implementing search for typeahead. CP 2013-12
class WordTransliterationFilter extends PHPTransliteration {

	/**
		* Constructs a transliteration filter object.
		*
		* @param string $language
		*/
	public function __construct() {
		parent::__construct();
	}

	public function isWordStartWithTitleLetter($titleLetter, $string, $langcode, $unknown_character = '?')
	{
		$this->readLanguageOverrides($langcode);

		if (function_exists('languagePreprocess_' . $langcode)) {
			LoggerFactory::getLogger()->logDebugMessage("Use Preprocess: " . $langcode);
			$string = call_user_func('languagePreprocess_' . $langcode, $this, $string, $unknown_character);
			//$string = languagePreprocess($this, $string, $unknown_character);
		}

		if (function_exists('overrideComparison_' . $langcode)) {
			LoggerFactory::getLogger()->logDebugMessage("Use overrideComparison: " . $langcode);
			// use languange specified comparison
			return call_user_func('overrideComparison_' . $langcode, $this, $string, $titleLetter);
			//return overrideComparison($this, $string, $titleLetter);
		}else
		{
			LoggerFactory::getLogger()->logDebugMessage("Use Normal: " . $langcode);
			LoggerFactory::getLogger()->logDebugMessage("BEFORE: " . $titleLetter . " / " . $string);
			$transedTitleLetter = $this->transliterate($titleLetter,$langcode, $unknown_character);
			$transedString = $this->transliterate($string,$langcode, $unknown_character);
			LoggerFactory::getLogger()->logDebugMessage("AFTER: " . $transedTitleLetter . " / " . $transedString);
			if (strpos(strtolower($transedString), strtolower($transedTitleLetter)) === 0)
			{
				return true;
			}else
			{
				return false;
			}
		}


	}

	public function ordUTF8External($character) {
		return $this::ordUTF8($character);
	}
}
?>