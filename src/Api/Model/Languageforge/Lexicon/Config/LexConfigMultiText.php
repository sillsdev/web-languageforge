<?php

namespace Api\Model\Languageforge\Lexicon\Config;

use Api\Model\Mapper\ArrayOf;

class LexConfigMultiText extends LexConfig
{
    public function __construct()
    {
        $this->type = LexConfig::MULTITEXT;
        $this->displayMultiline = false;
        $this->width = 20;
        $this->inputSystems = new ArrayOf();
    }

    /** @var int */
    public $width;

    /** @var ArrayOf */
    public $inputSystems;

    /** @var bool */
    public $displayMultiline;
}
