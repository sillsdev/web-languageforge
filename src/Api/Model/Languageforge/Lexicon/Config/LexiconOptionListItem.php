<?php

namespace Api\Model\Languageforge\Lexicon\Config;

class LexiconOptionListItem
{
    /**
     * @var string
     */
    public $key;

    /**
     * @var string
     */
    public $value;

    /**
     * @var string
     */
    public $abbreviation;

    /**
     * @var string
     */
    public $guid;

    public function __construct($value = '', $key = null)
    {
        $this->value = $value;
        if (is_null($key)) {
            $this->key = $value;
        } else {
            $this->key = $key;
        }
    }
}
