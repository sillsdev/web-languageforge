<?php

namespace Api\Model\Languageforge\Lexicon\Config;

class LexiconMultiParagraphConfigObj extends LexiconConfigObj
{
    public function __construct()
    {
        parent::__construct();
        $this->type = LexiconConfigObj::MULTIPARAGRAPH;
    }
}
