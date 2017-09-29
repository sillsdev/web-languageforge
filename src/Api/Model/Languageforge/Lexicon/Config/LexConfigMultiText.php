<?php

namespace Api\Model\Languageforge\Lexicon\Config;

use Api\Model\Shared\Mapper\ArrayOf;

class LexConfigMultiText extends LexConfig
{
    public function __construct()
    {
        parent::__construct();
        $this->type = LexConfig::MULTITEXT;
        $this->displayMultiline = false;
        $this->width = 20;
        $this->inputSystems = new ArrayOf();
    }

    /** @var int */
    public $width;

    /** @var ArrayOf */
    public $inputSystems;

    /** @var boolean */
    public $displayMultiline;
}
