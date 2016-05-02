<?php

namespace Api\Model\Languageforge\Lexicon\Config;

class LexMultiParagraphConfigObj extends LexiconConfigObj
{
    public function __construct()
    {
        parent::__construct();
        $this->type = LexiconConfigObj::MULTIPARAGRAPH;
    }
}
