<?php

namespace Api\Model\Languageforge\Lexicon\Config;

class LexConfigMultiParagraph extends LexConfig
{
    public function __construct()
    {
        parent::__construct();
        $this->type = self::MULTIPARAGRAPH;
    }
}
