<?php

namespace Api\Model\Languageforge\Lexicon;

class LexOptionListItem
{
    /** @var string */
    public $key;

    /** @var string */
    public $value;

    /** @var string */
    public $abbreviation;

    /** @var string */
    public $guid;

    public function __construct($value = "", $key = null, $guid = "")
    {
        if ($guid) {
            $this->guid = $guid;
        }
        $this->value = $value;
        if (is_null($key)) {
            $this->key = $value;
        } else {
            $this->key = $key;
        }
    }
}
