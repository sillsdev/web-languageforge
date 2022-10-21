<?php

namespace Api\Model\Languageforge\Lexicon\Config;

class LexConfigOptionList extends LexConfig
{
    public function __construct()
    {
        $this->type = LexConfig::OPTIONLIST;
        $this->listCode = "";
    }

    /** @var string */
    public $listCode;
}
