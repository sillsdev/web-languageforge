<?php

namespace Api\Model\Languageforge\Lexicon\Config;

use Api\Model\Mapper\ArrayOf;

class LexiconMultitextConfigObj extends LexiconConfigObj
{
    public function __construct()
    {
        $this->type = LexiconConfigObj::MULTITEXT;

        // default values
        $this->label = '';
        $this->displayMultiline = false;
        $this->width = 20;
        $this->inputSystems = new ArrayOf();
    }

    /**
     * @var string
     */
    public $label;

    /**
     * @var int
     */
    public $width;

    /**
     * @var ArrayOf
     */
    public $inputSystems;

    /**
     * @var bool
     */
    public $displayMultiline;

}
