<?php

namespace Api\Model\Languageforge\Lexicon\Config;

use Api\Model\Shared\Mapper\ArrayOf;
use Api\Model\Shared\Mapper\MapOf;

class LexRoleViewConfig
{
    public function __construct()
    {
        $this->inputSystems = new ArrayOf();
        $this->fields = new MapOf(function ($data) {
            if (array_key_exists("overrideInputSystems", $data)) {
                return new LexViewMultiTextFieldConfig();
            } else {
                return new LexViewFieldConfig();
            }
        });
        $this->showTasks = new MapOf();
    }

    /** @var ArrayOf<string> */
    public $inputSystems;

    /**
     * key is LexConfig field const
     * @var MapOf <LexViewFieldConfig>
     */
    public $fields;

    /**
     * key is LexTask const
     * @var MapOf <bool>
     */
    public $showTasks;
}

class LexViewFieldConfig
{
    public function __construct($show = true)
    {
        $this->show = $show;
        $this->type = "basic";
    }

    /** @var boolean */
    public $show;

    /** @var string */
    public $type;
}

class LexViewMultiTextFieldConfig extends LexViewFieldConfig
{
    public function __construct($show = true)
    {
        parent::__construct($show);
        $this->type = "multitext";
        $this->overrideInputSystems = false;
        $this->inputSystems = new ArrayOf();
    }

    /** @var boolean */
    public $overrideInputSystems;

    /** @var ArrayOf */
    public $inputSystems;
}
