<?php

namespace Api\Model\Languageforge\Translate;

use Api\Model\Languageforge\InputSystem;

class TranslateConfig
{
    public function __construct()
    {
        $this->source = new TranslateConfigDocument();
        $this->target = new TranslateConfigDocument();
    }

    /** @var TranslateConfigDocument */
    public $source;

    /** @var TranslateConfigDocument */
    public $target;
}

class TranslateConfigDocument
{
    public function __construct($tag = 'qaa', $name = '')
    {
        $this->inputSystem = new InputSystem($tag, $name);
    }

    /** @var InputSystem */
    public $inputSystem;
}
