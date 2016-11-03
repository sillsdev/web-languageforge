<?php

namespace Api\Model\Shared;

use Api\Model\Shared\Mapper\IdReference;

class UnreadItem
{
    public function __construct()
    {
        $this->itemRef = new IdReference();
        $this->type = "";
    }

    /** @var IdReference */
    public $itemRef;

    /** @var string */
    public $type;
}
