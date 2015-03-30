<?php

namespace models\languageforge\lexicon\config;

use models\mapper\ArrayOf;
use models\mapper\MapOf;

class LexRoleViewConfig
{
    public function __construct()
    {
        $this->fields = new MapOf(function ($data) {
            if (array_key_exists('overrideInputSystems', $data)) {
                return new LexViewMultiTextFieldConfig();
            } else {
                return new LexViewFieldConfig();
            }
        });
        $this->showTasks = new MapOf();
    }

    /**
     * key is LexiconConfigObj field const
     * @var MapOf <LexViewFieldConfig>
     */
    public $fields;

    /**
     * key is LexiconTask const
     * @var MapOf <bool>
     */
    public $showTasks;

}

class LexViewFieldConfig
{
    public function __construct($show = true)
    {
        $this->show = $show;
        $this->type = 'basic';
    }

    /**
     * @var bool
     */
    public $show;

    /**
     * @var string
     */
    public $type;

}

class LexViewMultiTextFieldConfig extends LexViewFieldConfig
{
    public function __construct($show = true)
    {
        parent::__construct($show);
        $this->type = 'multitext';
        $this->overrideInputSystems = false;
        $this->inputSystems = new ArrayOf();
    }

    /**
     * @var bool
     */
    public $overrideInputSystems;

    /**
     * @var ArrayOf
     */
    public $inputSystems;

}
