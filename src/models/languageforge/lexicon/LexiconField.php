<?php

namespace models\languageforge\lexicon;

class LexiconField
{
    public function __construct($value = '')
    {
        $this->value = $value;
    }

    public $value;

    public function __toString() {
        return $this->value;
    }

}
