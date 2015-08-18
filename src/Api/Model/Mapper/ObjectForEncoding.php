<?php

namespace Api\Model\Mapper;

class ObjectForEncoding
{
    /**
     * @var array
     */
    private $_privateProperties;

    /**
     * @var array
     */
    private $_readOnlyProperties;

    protected function setReadOnlyProp($propertyName)
    {
        if (!is_array($this->_readOnlyProperties)) {
            $this->_readOnlyProperties = array();
        }
        if (!in_array($propertyName, $this->_readOnlyProperties)) {
            $this->_readOnlyProperties[] = $propertyName;
        }
    }
    protected function setPrivateProp($propertyName)
    {
        if (!is_array($this->_privateProperties)) {
            $this->_privateProperties = array();
        }
        if (!in_array($propertyName, $this->_privateProperties)) {
            $this->_privateProperties[] = $propertyName;
        }
    }

    public function getReadOnlyProperties()
    {
        return $this->_readOnlyProperties;
    }

    public function getPrivateProperties()
    {
        return $this->_privateProperties;
    }
}
