<?php

namespace Api\Model\Shared\Mapper;

class Id
{
    public $id;

    public function __construct($id = "")
    {
        $this->id = $id;
    }

    public static function isEmpty($id)
    {
        return empty($id) || empty($id->id);
    }

    public function asString()
    {
        return $this->id;
    }

    public function __toString()
    {
        return empty($this->id) ? "_EmptyId_" : $this->id;
    }
}
