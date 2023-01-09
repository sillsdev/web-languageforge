<?php

namespace Api\Library\Shared;

use Api\Model\Shared\Mapper\ArrayOf;
use Api\Model\Shared\Mapper\JsonDecoder;
use Api\Model\Shared\Mapper\MapOf;

function _LanguageFunctor()
{
    return new Language();
}

/* LanguageData performance notes CP 2014-07
 * Uses 47M RAM (Measured pre 6.4M post 53M
 * Takes 1.2 seconds to read
 * Good candidate for going in the database.
 */
class LanguageData extends MapOf
{
    public function __construct()
    {
        parent::__construct("_LanguageFunctor");

        if (is_null(self::$_data)) {
            $this->read();
            self::$_data = $this->getArrayCopy();
        } else {
            $this->exchangeArray(self::$_data);
        }
    }

    private static $_data;

    public function read()
    {
        $json = file_get_contents(
            APPPATH . "angular-app/bellows/core/input-systems/input-systems-languages.generated-data.ts"
        );
        $json = str_replace(";", "", substr($json, strpos($json, "[")));
        $arr = json_decode($json, true);

        foreach ($arr as $obj) {
            $language = new Language();
            JsonDecoder::decode($language, $obj);
            $this[$language->code->three] = $language;

            // duplicate any two letter code languages with two letter code keys
            if ($language->code->two) {
                $this[$language->code->two] = $language;
            }
        }

        // add the unlisted language if it doesn't already exist
        $unlisted = new Language("Unlisted Language", "qaa");
        $unlisted->country[] = "?";
        $unlistedCode = $unlisted->code->three;
        if (!$this->offsetExists($unlistedCode)) {
            $this[$unlistedCode] = $unlisted;
        }
    }

    /**
     * Extracts the language code from the tag
     * @param string $tag
     * @return string
     */
    public static function getCode($tag)
    {
        $tokens = explode("-", $tag);

        return $tokens[0];
    }

    /**
     * @param string $tag
     * @return Language
     */
    public function getLanguage($tag)
    {
        $code = self::getCode($tag);
        return $this[$code];
    }
}

class LanguageCode
{
    public function __construct($codeThree = "")
    {
        $this->three = $codeThree;
    }

    /** @var string three letter language code */
    public $three;

    /** @var string two letter language code */
    public $two;
}

class Language
{
    public function __construct($name = "", $codeThree = "")
    {
        $this->name = $name;
        $this->code = new LanguageCode($codeThree);
        $this->country = new ArrayOf();
        $this->altNames = new ArrayOf();
    }

    /** @var string */
    public $name;

    /** @var LanguageCode */
    public $code;

    /** @var ArrayOf<string> */
    public $country;

    /** @var ArrayOf<string> */
    public $altNames;
}
