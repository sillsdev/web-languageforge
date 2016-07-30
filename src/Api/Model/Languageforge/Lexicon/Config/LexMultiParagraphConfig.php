<?php

namespace Api\Model\Languageforge\Lexicon\Config;

class LexMultiParagraphConfig extends LexiconConfigObj
{
    public function __construct()
    {
        parent::__construct();
        $this->type = self::MULTIPARAGRAPH;
    }
}
