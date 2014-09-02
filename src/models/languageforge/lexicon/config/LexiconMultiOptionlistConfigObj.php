<?php

namespace models\languageforge\lexicon\config;

class LexiconMultiOptionlistConfigObj extends LexiconOptionlistConfigObj
{
    public function __construct()
    {
        $this->type = LexiconConfigObj::MULTIOPTIONLIST;
    }
}
