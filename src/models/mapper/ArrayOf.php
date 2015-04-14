<?php
namespace models\mapper;

use Palaso\Utilities\CodeGuard;

class ArrayOf extends \ArrayObject
{
    /**
     * @param function The function <object> function($data = null) returns an instance of the object.
     */
    public function __construct($generator = null)
    {
        $this->_generator = $generator;
    }

    /**
     * @var function The function <object> function($data = null) returns an instance of the object.
     */
    private $_generator;

    private $data; // This is here to force client code using the older implementation to have a fatal error allowing us to identify code that needs upgrading. CP 2013-12

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
        CodeGuard::checkTypeAndThrow($index, 'integer');

        return parent::offsetGet($index);
    }

    public function offsetSet($index, $newval)
    {
        if ($index != NULL) {
            CodeGuard::checkTypeAndThrow($index, 'integer');
        }
        parent::offsetSet($index, $newval);
    }

    /**
     * Appends $value if it doesn't already exist in the array
     * @param unknown $value
     */
    public function value($value)
    {
        if ($this->count() <= 0 || !$this->array_search($value)) {
            $this[] = $value;
        }
    }

    /**
     * Return true if $item exists in the data
     * @param unknown $item
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
