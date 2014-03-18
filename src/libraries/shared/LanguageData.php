<?php

namespace libraries\shared;

use models\mapper\MapOf;
use models\mapper\ArrayOf;
use models\mapper\JsonDecoder;

class LanguageCode {
	
	public function __construct($codeThree = 'qaa') {
		$this->three = $codeThree;
		$this->two = '';
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
	
	public function __construct($name = 'Unlisted Language', $codeThree = 'qaa') {
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
		$json = substr($languagesFile, strpos($languagesFile, '['));
		$decoder = new JsonDecoder();
		$decoder->decodeMapOf('', $this, json_decode($json, true));
		
		// add the unlisted language if it doesn't already exist
		$unlisted = new Language();
		$unlisted->country[] = '?';
		$unlistedCode = $unlisted->code->three;
		if (! key_exists($unlistedCode, $this)) {
			$this[$unlistedCode] = $unlisted;
		}
		
		// duplicate any two letter code languages with two letter code keys 
		// TODO Fix. This doesn't work yet IJH 2014-03
		$arr = $this->getArrayCopy();
		$twoLetterLanguages = array();
		foreach (array_keys($arr) as $codeThree) {
			$language = $arr[$codeThree];
			if ($language->code->two) {
				$twoLetterLanguages[$language->code->two] = $language;
			}
		}
		$this->exchangeArray(array_merge($twoLetterLanguages, $arr));
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
