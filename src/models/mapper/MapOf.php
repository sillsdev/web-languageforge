<?php
namespace models\mapper;

use Palaso\Utilities\CodeGuard;

class MapOf extends \ArrayObject
{
    /**
     * @var function The function <object> function($data = null) returns an instance of the object.
     */
    private $_generator;

    private $data; // This is here to force client code using the older implementation to have a fatal error allowing us to identify code that needs upgrading. CP 2013-12

    /**
     * @param function The function <object> function($data = null) returns an instance of the object.
     */
    public function __construct($generator = null)
    {
        $this->_generator = $generator;
    }

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
        CodeGuard::checkTypeAndThrow($index, 'string');

        return parent::offsetGet($index);
    }

    public function offsetSet($index, $newval)
    {
        CodeGuard::checkTypeAndThrow($index, 'string');
        parent::offsetSet($index, $newval);
    }

}
