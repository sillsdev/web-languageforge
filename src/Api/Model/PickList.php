<?php
namespace Api\Model;

use Api\Model\Mapper\Id;

use Api\Model\Mapper\ArrayOf;

class PickItem
{
    /**
     * @var string
     */
    public $key;

    /**
     * @var string
     */
    public $value;

}

class PickList
{
    public function __construct($name = '')
    {
        $this->id = new Id();
        $this->name = $name;
        $this->items = new ArrayOf(function ($data) {
            return new PickItem();
        });

    }

    /**
     * @var string
     */
    public $id;

    /**
     * @var string
     */
    public $name;

    /**
     * @var ArrayOf ArrayOf<PickItem>
     */
    public $items;

    /**
     * @var string
     */
    public $defaultKey;
}
