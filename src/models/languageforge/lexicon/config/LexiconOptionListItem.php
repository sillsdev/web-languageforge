<?php

namespace models\languageforge\lexicon\config;

class LexiconOptionListItem
{
    public $key;
    public $value;

    /**
     *
     * @var string
     */
    public $abbreviation;

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
