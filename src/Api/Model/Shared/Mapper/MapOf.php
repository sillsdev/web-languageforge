<?php

namespace Api\Model\Shared\Mapper;

use Palaso\Utilities\CodeGuard;

class MapOf extends \ArrayObject
{
    /**
     * @param callable $generator The function <object> function($data = null) returns an instance of the object.
     */
    public function __construct($generator = null)
    {
        $this->_generator = $generator;
    }

    /** @var callable The function <object> function($data = null) returns an instance of the object. */
    private $_generator;

    // This is here to force client code using the older implementation to have a fatal error allowing us to identify code that needs upgrading. CP 2013-12
    /** @noinspection PhpUnusedPrivateFieldInspection */ private $data;

    public function generate($data = null)
    {
        $function = $this->_generator;

        return $function($data);
    }

    public function hasGenerator()
    {
        return $this->_generator != null;
    }

    public function offsetGet($index)
    {
        CodeGuard::checkTypeAndThrow($index, "string");
        return parent::offsetGet($index);
    }

    public function offsetSet($index, $newval)
    {
        CodeGuard::checkTypeAndThrow($index, "string");
        parent::offsetSet($index, $newval);
    }

    public function offsetExists($index)
    {
        CodeGuard::checkTypeAndThrow($index, "string");
        return parent::offsetExists($index);
    }
}
