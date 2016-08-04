<?php

namespace Api\Model\Languageforge\Lexicon\Config;

class LexConfigMultiOptionList extends LexConfigOptionList
{
    public function __construct()
    {
        parent::__construct();
        $this->type = LexConfig::MULTIOPTIONLIST;
    }
}
