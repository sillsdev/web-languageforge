<?php

namespace Api\Model\Shared\Mapper;

use Palaso\Utilities\CodeGuard;

class ArrayOf extends \ArrayObject
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
        CodeGuard::checkTypeAndThrow($index, "integer");

        return parent::offsetGet($index);
    }

    public function offsetSet($index, $newval)
    {
        if ($index != null) {
            CodeGuard::checkTypeAndThrow($index, "integer");
        }
        parent::offsetSet($index, $newval);
    }

    /**
     * Appends $value if it doesn't already exist in the array
     * @param mixed $value
     */
    public function ensureValueExists($value)
    {
        if ($this->count() <= 0 || !$this->array_search($value)) {
            $this[] = $value;
        }
    }

    /**
     * Return true if $item exists in the data
     * @param mixed $item
     * @return boolean
     */
    public function array_search($item)
    {
        foreach ($this as $value) {
            if ($value == $item) {
                return true;
            }
        }

        return false;
    }
}
