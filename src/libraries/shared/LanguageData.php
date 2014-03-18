<?php

namespace libraries\shared;

use models\mapper\MapOf;
use models\mapper\ArrayOf;
use models\mapper\JsonDecoder;

class LanguageCode {
	
	public function __construct($codeThree = '') {
		$this->three = $codeThree;
	}
	
	/**
	 * three letter language code
	 * @var string
	 */
	public $three;
	
	/**
	 * two letter language code
	 * @var string
	 */
	public $two;
	
}

class Language {
	
	public function __construct($name = '', $codeThree = '') {
		$this->name = $name;
		$this->code = new LanguageCode($codeThree);
		$this->country = new ArrayOf();
		$this->altNames = new ArrayOf();
	}
	
	/**
	 * @var string
	 */
	public $name;
	
	/**
	 * @var LanguageCode
	 */
	public $code;
	
	/**
	 * @var ArrayOf <string>
	 */
	public $country;
	
	/**
	 * @var ArrayOf <string>
	 */
	public $altNames;
	
}

class LanguageData extends MapOf {
	
	public function __construct() {
		parent::__construct(
			function ($data) {
				return new Language();
			}
		);
		
		if (is_null(self::$_data)) {
			$this->read();
			self::$_data = $this->getArrayCopy();
		} else {
			$this->exchangeArray(self::$_data);
		}
	}
	
	private static $_data;
	
	public function read() {
		$languagesFile = file_get_contents(APPPATH . "angular-app/bellows/js/inputSystems_languages.js");
		$json = str_replace(";", "", substr($languagesFile, strpos($languagesFile, '[')));
		$arr = json_decode($json, true);

		$decoder = new JsonDecoder();
		foreach ($arr as $obj) {
			$language = new Language();
			$decoder->decode($language, $obj);
			$this[$language->code->three] = $language;
			
			// duplicate any two letter code languages with two letter code keys
			if ($language->code->two) {
				$this[$language->code->two] = $language;
			}
		}
		
		// add the unlisted language if it doesn't already exist
		$unlisted = new Language('Unlisted Language', 'qaa');
		$unlisted->country[] = '?';
		$unlistedCode = $unlisted->code->three;
		if (! key_exists($unlistedCode, $this)) {
			$this[$unlistedCode] = $unlisted;
		}
	}
	
	/**
	 * Extracts the language code from the tag
	 * @param string $tag
	 * @return string 
	 */
	public function getCode($tag) {
		$tokens = explode('-', $tag);
		return $tokens[0];
	}
	
}

?>
