<?php

namespace Api\Model;

use Api\Model\Mapper\IdReference;

class UnreadItem
{
    public function __construct()
    {
        $this->itemRef = new IdReference();
        $this->type = "";
    }

    /**
     * @var IdReference
     */
    public $itemRef;

    /**
     *
     * @var string
     */
    public $type;
}
