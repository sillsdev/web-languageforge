<?php

namespace Api\Model\Languageforge\Lexicon\Config;

class LexiconMultiOptionlistConfigObj extends LexiconOptionlistConfigObj
{
    public function __construct()
    {
        parent::__construct();
        $this->type = LexiconConfigObj::MULTIOPTIONLIST;
    }
}
