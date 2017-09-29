<?php

namespace Api\Model\Scriptureforge\Sfchecks;

use Api\Model\Shared\Mapper\ArrayOf;
use Api\Model\Shared\Mapper\Id;

class PickList
{
    public function __construct($name = '')
    {
        $this->id = new Id();
        $this->name = $name;
        $this->items = new ArrayOf(function () {
            return new PickItem();
        });

    }

    /** @var string */
    public $id;

    /** @var string */
    public $name;

    /** @var ArrayOf<PickItem> */
    public $items;

    /** @var string */
    public $defaultKey;
}

class PickItem
{
    /** @var string */
    public $key;

    /** @var string */
    public $value;
}
